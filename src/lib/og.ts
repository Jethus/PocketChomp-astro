/**
 * Open Graph card renderer. Builds a 1200×630 PNG at build time from the
 * page's eyebrow, title and subtitle, beside the app's Diary on a phone, so
 * a shared link shows the product and not only words. Search engines pick a
 * page's preview image from og:image and prefer one that shows the subject.
 *
 * The look follows the Google Play feature graphic: the ember field, a disc
 * one shade lighter behind the phone, the wordmark and type in white.
 *
 * Rendering is satori (element tree → SVG) followed by resvg (SVG → PNG).
 * Fonts are passed in as buffers, so the result is identical on every machine;
 * no system fonts are involved.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type satoriType from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { OG_WIDTH, OG_HEIGHT, type OgCard } from "./og-cards";

const require = createRequire(import.meta.url);
// satori's ESM bundle (0.36) reads __dirname to find yoga.wasm, which throws
// under Node ESM, so load the CommonJS build instead.
const satori = require("satori").default as typeof satoriType;

export type { OgCard };

// The feature graphic's colours.
const FIELD_TOP = "#C4500A";
const FIELD_BOTTOM = "#A94204";
const DISC = "#D9691F";
const WHITE = "#FFFFFF";
const CREAM = "#FCE9DC";

// The phone runs off the bottom edge; the text column stops short of it.
const PHONE = { width: 360, left: 772, top: 64 };
const TEXT_WIDTH = 630;

let fontsCache: ReturnType<typeof loadFonts> | undefined;
let logoCache: string | undefined;
let phoneCache: Promise<{ uri: string; height: number }> | undefined;

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
    // Both of the wordmark's colours go to white so it holds on the ember field.
    const svg = readFileSync(root("src/assets/svgs/logo-light.svg"), "utf8")
      .replaceAll("#3D7358", WHITE)
      .replaceAll("#FF4000", WHITE);
    logoCache = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }
  return logoCache;
}

/** The framed Diary capture, scaled once to the size it is drawn at. */
function phoneImage() {
  phoneCache ??= sharp(root("src/assets/product/captures-native/framed/diary.png"))
    .resize({ width: PHONE.width })
    .png()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => ({ uri: `data:image/png;base64,${data.toString("base64")}`, height: info.height }));
  return phoneCache;
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

/** Shorter titles get bigger type; the column beside the phone is narrow. */
function titleSize(title: string) {
  if (title.length <= 28) return 66;
  if (title.length <= 44) return 56;
  if (title.length <= 64) return 48;
  return 42;
}

function h(type: string, props: Record<string, unknown>, ...children: unknown[]) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

export async function renderOgCard(card: OgCard): Promise<Buffer> {
  fontsCache ??= loadFonts();
  const subtitle = card.subtitle ? clip(card.subtitle, 120) : undefined;
  const phone = await phoneImage();

  const tree = h(
    "div",
    {
      style: {
        position: "relative",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        overflow: "hidden",
        backgroundImage: `linear-gradient(to bottom, ${FIELD_TOP}, ${FIELD_BOTTOM})`,
        color: WHITE,
        fontFamily: "Geist",
      },
    },
    // Disc and phone, to the right of the text so every word sits on the plain field.
    h("div", {
      style: { display: "flex", position: "absolute", left: 660, top: 70, width: 700, height: 700, borderRadius: 350, backgroundColor: DISC },
    }),
    h("img", {
      src: phone.uri,
      width: PHONE.width,
      height: phone.height,
      style: { position: "absolute", left: PHONE.left, top: PHONE.top },
    }),
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: TEXT_WIDTH + 72,
          height: OG_HEIGHT,
          padding: "60px 0 44px 72px",
        },
      },
      // Wordmark
      h("div", { style: { display: "flex" } }, h("img", { src: logoDataUri(), width: 300, height: 47 })),
      // Eyebrow, title, subtitle
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" } },
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              fontFamily: "Montserrat",
              fontWeight: 900,
              fontSize: 19,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: CREAM,
              marginBottom: 20,
            },
          },
          h("div", { style: { display: "flex", width: 40, height: 3, backgroundColor: WHITE, marginRight: 16 } }),
          h("div", { style: { display: "flex" } }, card.eyebrow),
        ),
        h(
          "div",
          {
            style: {
              fontFamily: "Montserrat",
              fontWeight: 900,
              fontSize: titleSize(card.title),
              lineHeight: 1.06,
              letterSpacing: -1,
              color: WHITE,
            },
          },
          card.title,
        ),
        subtitle
          ? h("div", { style: { marginTop: 22, fontSize: 26, lineHeight: 1.4, color: CREAM } }, subtitle)
          : h("div", {}),
      ),
      h("div", { style: { display: "flex", fontSize: 24, fontWeight: 700, color: WHITE } }, "pocketchomp.com"),
    ),
  );

  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: fontsCache });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
