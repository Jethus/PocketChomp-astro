import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src", "assets", "product");
const out = path.join(root, "src", "assets", "ui");

const W = 1344;
const H = 2992;

// crop by fractional box {l,t,r,b} of the source image
const crops = [
  // Full-screen center shot: dashboard with the device status bar trimmed off
  // so it reads as product UI, not a debug screen capture.
  {
    src: "Screenshot_20260624-191845.png",
    name: "ui-dashboard.png",
    box: { l: 0, t: 0.052, r: 1, b: 1 },
  },
  {
    src: "Screenshot_20260624-191845.png",
    name: "ui-calories.png",
    box: { l: 0.042, t: 0.168, r: 0.958, b: 0.342 },
  },
  {
    src: "Screenshot_20260624-191845.png",
    name: "ui-macros.png",
    box: { l: 0.042, t: 0.355, r: 0.958, b: 0.55 },
  },
  {
    src: "Screenshot_20260624-191909.png",
    name: "ui-ring.png",
    box: { l: 0.06, t: 0.355, r: 0.94, b: 0.63 },
  },
  {
    src: "Screenshot_20260624-191905.png",
    name: "ui-search-row.png",
    box: { l: 0.04, t: 0.295, r: 0.96, b: 0.43 },
  },
  {
    src: "Screenshot_20260624-191909.png",
    name: "ui-detailed.png",
    box: { l: 0.04, t: 0.64, r: 0.96, b: 0.9 },
  },
  // Plate summary with logged items — clean, ad-free list UI (ValuePillars "no ads")
  {
    src: "Screenshot_20260624-192156.png",
    name: "ui-plate.png",
    box: { l: 0, t: 0.505, r: 1, b: 0.83 },
  },
  // Scanned Canadian grocery label: "Neilson Half & Half Cream" (ValuePillars "canadian")
  {
    src: "Screenshot_20260624-192035.png",
    name: "ui-label-scan.png",
    box: { l: 0.035, t: 0.215, r: 0.965, b: 0.53 },
  },
  // Full Add Food screen, status bar trimmed (ClosingCTA phone)
  {
    src: "Screenshot_20260624-191909.png",
    name: "ui-addfood.png",
    box: { l: 0, t: 0.052, r: 1, b: 1 },
  },
  // Full app screens for the hero side panels — portrait sources that
  // match the tall panel aspect (~0.5-0.65 w/h) without mid-widget crops.
  {
    src: "Screenshot_20260624-192035.png",
    name: "ui-screen-label.png",
    box: { l: 0, t: 0.052, r: 1, b: 1 },
  },
  {
    // starts below a cut-off widget so the micros card leads
    src: "Screenshot_20260624-191848.png",
    name: "ui-screen-library.png",
    box: { l: 0, t: 0.09, r: 1, b: 1 },
  },
  {
    src: "Screenshot_20260624-191905.png",
    name: "ui-screen-search.png",
    box: { l: 0, t: 0.052, r: 1, b: 1 },
  },
  {
    src: "Screenshot_20260624-192156.png",
    name: "ui-screen-plate.png",
    box: { l: 0, t: 0.052, r: 1, b: 1 },
  },
];

const px = (frac, total) => Math.round(frac * total);

for (const c of crops) {
  const left = px(c.box.l, W);
  const top = px(c.box.t, H);
  const width = px(c.box.r, W) - left;
  const height = px(c.box.b, H) - top;
  await sharp(path.join(dir, c.src))
    .extract({ left, top, width, height })
    .png()
    .toFile(path.join(out, c.name));
  console.log(`${c.name}  ${width}x${height}`);
}
