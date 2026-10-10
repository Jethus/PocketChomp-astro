/**
 * Open Graph card renderer. Builds a 1200×630 PNG at build time from the
 * page's eyebrow, title and subtitle, so every shared link gets a card in the
 * brand type instead of a bare text preview.
 *
 * Rendering is satori (element tree → SVG) followed by resvg (SVG → PNG).
 * Fonts are passed in as buffers, so the result is identical on every machine;
 * no system fonts are involved. The colours are the sRGB equivalents of the
 * light-theme OKLCH tokens in src/styles/global.css.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type satoriType from "satori";
import { Resvg } from "@resvg/resvg-js";
import { OG_WIDTH, OG_HEIGHT, type OgCard } from "./og-cards";

const require = createRequire(import.meta.url);
// satori's ESM bundle (0.36) reads __dirname to find yoga.wasm, which throws
// under Node ESM, so load the CommonJS build instead.
const satori = require("satori").default as typeof satoriType;

export type { OgCard };

// Light-theme tokens: the app's own hex values, as in src/styles/global.css.
const BACKGROUND = "#ECEFEC"; // --background (paper)
const FOREGROUND = "#2A2F2C"; // --foreground (charcoal)
const MUTED = "#555555"; // --muted-foreground (slate)
const EMBER = "#BD4C00"; // --accent (ember)

let fontsCache: ReturnType<typeof loadFonts> | undefined;
let logoCache: string | undefined;

// Paths resolve from the project root: the build bundles this module under
// dist/.prerender, so import.meta.url is no use, and geist's package exports
// do not expose its font files to require.resolve.
const root = (p: string) => resolve(process.cwd(), p);

function loadFonts() {
  // satori reads TTF, OTF and WOFF but not WOFF2; these are the non-woff2 cuts.
  const montserratBlack = readFileSync(root("node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff"));
  const geistRegular = readFileSync(root("node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf"));
  const geistBold = readFileSync(root("node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf"));
  return [
    { name: "Montserrat", data: montserratBlack, weight: 900 as const, style: "normal" as const },
    { name: "Geist", data: geistRegular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: geistBold, weight: 700 as const, style: "normal" as const },
  ];
}

function logoDataUri() {
  if (!logoCache) {
    const svg = readFileSync(root("src/assets/svgs/logo-light.svg"), "utf8");
    logoCache = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }
  return logoCache;
}

/**
 * Cut a subtitle to roughly three lines at the rendered size. Whole sentences
 * are kept while they fit; only when the first sentence alone is too long does
 * it fall back to a word-boundary cut with an ellipsis.
 */
function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [];
  let kept = "";
  for (const s of sentences) {
    if ((kept + s).trimEnd().length > max) break;
    kept += s;
  }
  if (kept.trim()) return kept.trimEnd();
  const cut = text.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut.replace(/[,;:.\s—-]+$/, "")}…`;
}

/** Shorter titles get bigger type; nothing wraps past three lines. */
function titleSize(title: string) {
  if (title.length <= 28) return 84;
  if (title.length <= 44) return 72;
  if (title.length <= 64) return 60;
  return 52;
}

function h(type: string, props: Record<string, unknown>, ...children: unknown[]) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

export async function renderOgCard(card: OgCard): Promise<Buffer> {
  fontsCache ??= loadFonts();
  const subtitle = card.subtitle ? clip(card.subtitle, 190) : undefined;

  const tree = h(
    "div",
    {
      style: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 0",
        backgroundColor: BACKGROUND,
        color: FOREGROUND,
        fontFamily: "Geist",
      },
    },
    // Wordmark
    h("div", { style: { display: "flex" } }, h("img", { src: logoDataUri(), width: 348, height: 54 })),
    // Eyebrow, title, subtitle
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", paddingBottom: 24 } },
      // Eyebrow as the site draws it: an ember rule, then the label in slate.
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 22,
          },
        },
        h("div", { style: { display: "flex", width: 44, height: 3, backgroundColor: EMBER, marginRight: 18 } }),
        h("div", { style: { display: "flex" } }, card.eyebrow),
      ),
      h(
        "div",
        {
          style: {
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: titleSize(card.title),
            lineHeight: 1.04,
            letterSpacing: -1.5,
            color: FOREGROUND,
          },
        },
        card.title,
      ),
      subtitle
        ? h("div", { style: { marginTop: 26, fontSize: 30, lineHeight: 1.4, color: MUTED, maxWidth: 980 } }, subtitle)
        : h("div", {}),
    ),
    // Footer line and ember rule
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            paddingBottom: 30,
          },
        },
        h("div", { style: { fontWeight: 700, color: FOREGROUND } }, "pocketchomp.com"),
        h("div", { style: { color: MUTED } }, "Free calorie counter · Built for Canadians · Android"),
      ),
      h("div", { style: { display: "flex", height: 10, backgroundColor: EMBER } }),
    ),
  );

  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: fontsCache });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
