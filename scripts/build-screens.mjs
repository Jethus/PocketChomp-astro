// Builds every phone-screen asset the site renders from the native Pixel captures.
//
//   node scripts/build-screens.mjs
//
// Inputs
//   src/assets/product/captures-native/*.png   raw 1344x2992 screenshots from the
//                                              Pixel 8 Pro at full resolution
//                                              (scripts/capture.ps1), status bar
//                                              still in place
//   src/assets/product/device-art/pixel_8_pro/ the Pixel 8 Pro skin that ships
//     back.webp, mask.webp, layout             with the Android SDK emulator
//
// Outputs
//   src/assets/screens/screen-*.webp  the capture composited into the skin at
//                                     its native 1344x2992 window (nothing is
//                                     scaled), status bar blanked, corners and
//                                     punch hole cut by the skin's own mask
//   src/assets/ui/hero-*.webp         UI extracts for the hero grid
//
// Site-facing outputs are lossless WebP: pixel-identical to the PNG at well
// under half the size, and Astro re-encodes them into sized renditions at
// build time anyway. Design-tool copies (framed/, clean/, rounded/) stay PNG.
//
// Geometry comes from the skin's `layout` file: display 1344x2992, placed at
// (58,58) inside the 1469x3104 back image. The mask is opaque where the frame
// covers the display (corners, camera), so it is inverted to become the
// screen's alpha.
import sharp from "sharp";
import path from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const capturesDir = path.join(root, "src", "assets", "product", "captures-native");
const artDir = path.join(root, "src", "assets", "product", "device-art", "pixel_8_pro");
const screensDir = path.join(root, "src", "assets", "screens");
const uiDir = path.join(root, "src", "assets", "ui");

const CAPTURE = { width: 1344, height: 2992 };
// Status bar inset reported by the window manager at full resolution.
const STATUS_BAR = 151;

const PLATE = { width: 1469, height: 3104 };
const SCREEN_OFFSET = { left: 58, top: 58 };

// Rectangles painted over with the capture's own background before the capture
// goes into the frame. The colour is sampled from `at` in that capture, so a
// dimmed modal backdrop stays dimmed.
const ERASE = {
  // "354 burned" chip on the diary's calories row; it is not part of the story.
  burnedChip: { left: 966, top: 588, width: 318, height: 77, at: { x: 960, y: 625 } },
};

const screens = [
  { capture: "today", out: "screen-today", erase: [ERASE.burnedChip] },
  { capture: "search", out: "screen-search" },
  { capture: "food-detail", out: "screen-food-detail" },
  { capture: "scan", out: "screen-scan" },
  { capture: "label-1", out: "screen-label" },
  { capture: "add-sheet", out: "screen-add-sheet", erase: [ERASE.burnedChip] },
  { capture: "plate", out: "screen-plate" },
  { capture: "diary-meal", out: "screen-diary-meal" },
  { capture: "metrics", out: "screen-metrics" },
  { capture: "plan", out: "screen-plan" },
  { capture: "food-insights", out: "screen-food-insights" },
  { capture: "trends", out: "screen-trends" },
  { capture: "offline", out: "screen-offline" },
  { capture: "guest", out: "screen-guest" },
];

// Hero extracts: full-width slices of a capture, sized to the panel they fill
// (see the grid-template-rows note in Hero.astro).
const heroCrops = [
  { src: "search", name: "hero-search", top: 500, height: 1055 },
  { src: "metrics", name: "hero-metrics", top: 880, height: 508 },
  { src: "plan", name: "hero-plan", top: 1105, height: 1045 },
];

async function pixelAt(image, x, y) {
  const { data } = await image.clone().extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2], alpha: 1 };
}

function solid(width, height, { r, g, b }) {
  return { create: { width, height, channels: 4, background: { r, g, b, alpha: 1 } } };
}

async function loadSkin() {
  const back = sharp(path.join(artDir, "back.webp"));
  const mask = sharp(path.join(artDir, "mask.webp"));
  const [backMeta, maskMeta] = await Promise.all([back.metadata(), mask.metadata()]);
  if (backMeta.width !== PLATE.width || backMeta.height !== PLATE.height) {
    throw new Error(`back.webp is ${backMeta.width}x${backMeta.height}, expected ${PLATE.width}x${PLATE.height}`);
  }
  if (maskMeta.width !== CAPTURE.width || maskMeta.height !== CAPTURE.height) {
    throw new Error(`mask.webp is ${maskMeta.width}x${maskMeta.height}, expected ${CAPTURE.width}x${CAPTURE.height}`);
  }
  // Screen alpha = inverse of the mask's alpha. `dest-in` reads the alpha
  // channel of its input, so keep this RGBA (a greyscale image would count as
  // fully opaque and clip nothing).
  const screenAlpha = await mask.clone().ensureAlpha().negate({ alpha: true }).png().toBuffer();
  const backBuffer = await back.clone().png().toBuffer();
  return { back: backBuffer, screenAlpha };
}

const SITE_WEBP = { lossless: true, effort: 6 };

async function buildPlate({ capture: captureName, out, erase = [] }, skin, outDir = screensDir) {
  const forSite = outDir === screensDir;
  const src = path.join(capturesDir, `${captureName}.png`);
  const capture = sharp(src);
  const meta = await capture.metadata();
  if (meta.width !== CAPTURE.width || meta.height !== CAPTURE.height) {
    throw new Error(`${src} is ${meta.width}x${meta.height}, expected ${CAPTURE.width}x${CAPTURE.height}`);
  }

  const patches = [];
  const barColour = await pixelAt(capture, 0, 0);
  patches.push({ input: solid(CAPTURE.width, STATUS_BAR, barColour), left: 0, top: 0 });
  for (const rect of erase) {
    const colour = await pixelAt(capture, rect.at.x, rect.at.y);
    patches.push({ input: solid(rect.width, rect.height, colour), left: rect.left, top: rect.top });
  }

  const patched = await capture.clone().ensureAlpha().composite(patches).png().toBuffer();
  const screen = await sharp(patched)
    .composite([{ input: skin.screenAlpha, blend: "dest-in" }])
    .png()
    .toBuffer();

  const plate = sharp(skin.back).composite([{ input: screen, left: SCREEN_OFFSET.left, top: SCREEN_OFFSET.top }]);
  await (forSite ? plate.webp(SITE_WEBP) : plate.png({ compressionLevel: 9 })).toFile(
    path.join(outDir, `${out}.${forSite ? "webp" : "png"}`)
  );
}

async function buildHeroCrop({ src, name, top, height }) {
  await sharp(path.join(capturesDir, `${src}.png`))
    .extract({ left: 0, top, width: CAPTURE.width, height })
    .webp(SITE_WEBP)
    .toFile(path.join(uiDir, `${name}.webp`));
}

// Frameless copies of every raw capture with the display's corner radius
// applied (108 px, from the skin's layout) and nothing else changed. For use
// outside the site, e.g. store tooling or Photoshop.
const CORNER_RADIUS = 108;
const roundedDir = path.join(capturesDir, "rounded");

async function buildRounded(file) {
  const mask = Buffer.from(
    `<svg width="${CAPTURE.width}" height="${CAPTURE.height}"><rect width="${CAPTURE.width}" height="${CAPTURE.height}" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="#fff"/></svg>`
  );
  await sharp(path.join(capturesDir, file))
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(roundedDir, file));
}

// Store-tool input (AppScreens has a Pixel 8 Pro mockup at the native size):
// the capture at full 1344x2992 with the status bar blanked and the chip
// erased. Corners stay square; the store tool draws its own device frame.
const STORE = { height: CAPTURE.height, cropTop: 0 };
const storeDir = path.join(capturesDir, "clean");

async function buildStore({ capture: captureName, erase = [] }) {
  const capture = sharp(path.join(capturesDir, `${captureName}.png`));
  const patches = [{ input: solid(CAPTURE.width, STATUS_BAR, await pixelAt(capture, 0, 0)), left: 0, top: 0 }];
  for (const rect of erase) {
    patches.push({ input: solid(rect.width, rect.height, await pixelAt(capture, rect.at.x, rect.at.y)), left: rect.left, top: rect.top });
  }
  const patched = await capture.clone().composite(patches).png().toBuffer();
  await sharp(patched)
    .extract({ left: 0, top: STORE.cropTop, width: CAPTURE.width, height: STORE.height })
    .png({ compressionLevel: 9 })
    .toFile(path.join(storeDir, `${captureName}.png`));
}

// Framed copy of EVERY raw capture (spares included) for design work outside the
// site: same plate pipeline, written next to the raws in captures-native/framed/.
const framedDir = path.join(capturesDir, "framed");

async function buildFramedAll(skin, rawFiles) {
  await mkdir(framedDir, { recursive: true });
  const byCapture = new Map(screens.map((s) => [s.capture, s]));
  await Promise.all(
    rawFiles.map((file) => {
      const capture = file.replace(/\.png$/, "");
      const known = byCapture.get(capture);
      const erase = known?.erase ?? (capture.startsWith("today") ? [ERASE.burnedChip] : []);
      return buildPlate({ capture, out: capture, erase }, skin, framedDir);
    })
  );
}

const skin = await loadSkin();
await Promise.all(screens.map((screen) => buildPlate(screen, skin)));
await mkdir(storeDir, { recursive: true });
await Promise.all(screens.map(buildStore));
console.log(`${screens.length} store crops (${CAPTURE.width}x${STORE.height}) in ${path.relative(root, storeDir)}`);
await Promise.all(heroCrops.map(buildHeroCrop));
await mkdir(roundedDir, { recursive: true });
const rawFiles = (await readdir(capturesDir)).filter((f) => f.endsWith(".png"));
await Promise.all(rawFiles.map(buildRounded));
await buildFramedAll(skin, rawFiles);
console.log(`${rawFiles.length} framed copies in ${path.relative(root, framedDir)}`);
console.log(`${rawFiles.length} rounded copies in ${path.relative(root, roundedDir)}`);

console.log(`plate ${PLATE.width}x${PLATE.height}, screen ${CAPTURE.width}x${CAPTURE.height} at (${SCREEN_OFFSET.left},${SCREEN_OFFSET.top})`);
console.log(`${screens.length} plates, ${heroCrops.length} hero crops`);
