// Visual-review helper: full-viewport screenshots of the dev server at
// light/dark x desktop/mobile, reveal animations disabled for capture.
// Usage: node scripts/screenshot.mjs [outDir] [path]
import { chromium } from "playwright";
import path from "node:path";

const outDir = process.argv[2] ?? "screenshots";
const route = process.argv[3] ?? "/";
const base = `http://localhost:4321${route}`;

const shots = [
  { name: "light-desktop", theme: "light", width: 1440, height: 900 },
  { name: "dark-desktop", theme: "dark", width: 1440, height: 900 },
  { name: "light-mobile", theme: "light", width: 375, height: 812 },
  { name: "dark-mobile", theme: "dark", width: 375, height: 812 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    reducedMotion: "reduce",
  });
  await ctx.addInitScript((theme) => {
    try { localStorage.setItem("theme", theme); } catch {}
  }, s.theme);
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, `${s.name}.png`) });
  console.log(`${s.name}.png`);
  await ctx.close();
}
await browser.close();
