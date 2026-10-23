//   node scripts/build-email-assets.mjs
//
// PNG logos for the Kit email templates (email clients strip SVG).
// Rendered at 3x from the site's wordmarks into public/email/:
//   wordmark.png        sage glyphs + ember donut, for light paper
//   wordmark-white.png  white glyphs + dark-theme ember donut, for dark slabs
//   donut.png           the donut alone, for footers
import { readFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const svgs = "C:/repos/PocketChomp-astro/src/assets/svgs/";
const out = "C:/repos/PocketChomp-astro/public/email/";
mkdirSync(out, { recursive: true });

const light = readFileSync(svgs + "logo-light.svg", "utf8");
const dark = readFileSync(svgs + "logo-dark.svg", "utf8");

// Wordmark viewBox is 600x93; the donut sits at roughly x 412..472, y 14..74.
// The neighbouring glyphs touch that box, so they are dropped, not cropped.
const donut = light.replace(/<path[^>]*fill="#4A714C"[^>]*\/>/g, "")
  .replace(/viewBox="[^"]*"/, 'viewBox="411 13 63 63"')
  .replace(/width="600" height="93"/, 'width="63" height="63"');

const jobs = [
  [light, "wordmark.png", 600],
  [dark, "wordmark-white.png", 600],
  [donut, "donut.png", 96],
];
for (const [svg, name, width] of jobs) {
  await sharp(Buffer.from(svg), { density: 600 }).resize({ width }).png({ compressionLevel: 9 }).toFile(out + name);
  console.log("wrote", name);
}
