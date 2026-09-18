//   node scripts/build-logos.mjs
//
// Derives the site's two wordmarks from the app's source logo
// (assets/PocketChomp logo.svg: 10 sage glyph paths + 1 ember donut).
//   light: sage glyphs + ember donut, as drawn
//   dark:  white glyphs + the dark-theme ember donut
// P3 style attributes are stripped; sRGB hex only.
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("C:/repos/PocketChomp/assets/PocketChomp logo.svg", "utf8");
const SAGE = "#3D7358";
const EMBER = "#BD4C00";
const EMBER_DARK = "#E4551C";

function variant(glyph, donut) {
  // Inline fill styles (sRGB and P3) would override the fill attribute
  let out = src.replace(/\s+style="fill:[^"]*"/g, "");
  let sage = 0, ember = 0;
  out = out.replace(/fill="(#[0-9A-Fa-f]{6})"/g, (m, hex) => {
    if (hex.toUpperCase() === SAGE) { sage++; return `fill="${glyph}"`; }
    if (hex.toUpperCase() === EMBER) { ember++; return `fill="${donut}"`; }
    throw new Error(`unexpected fill ${hex}`);
  });
  if (sage !== 10 || ember !== 1) throw new Error(`fills: sage ${sage}, ember ${ember}`);
  if (/display-p3/.test(out)) throw new Error("P3 remains");
  return out;
}

const dir = "C:/repos/PocketChomp-astro/src/assets/svgs/";
writeFileSync(dir + "logo-light.svg", variant(SAGE, EMBER));
writeFileSync(dir + "logo-dark.svg", variant("#FFFFFF", EMBER_DARK));
console.log("wrote logo-light.svg and logo-dark.svg");
