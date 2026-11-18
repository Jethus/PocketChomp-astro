/**
 * Did today's build produce anything the live site does not have? Compares
 * dist/seo-manifest.json with the live one and prints what would go live.
 * In GitHub Actions it sets the outputs `changed` and `summary`.
 *
 *   node seo/release-check.mjs
 */
import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DIST, MANIFEST, SITE } from "./config.mjs";
import { changedUrls } from "./indexnow.mjs";

const built = JSON.parse(readFileSync(join(DIST, MANIFEST), "utf8")).pages;
const res = await fetch(`${SITE}/${MANIFEST}`, { cache: "no-store" });
// No manifest on the live site means it predates the engine; a deploy is due.
const live = res.ok ? (await res.json()).pages : {};

const urls = changedUrls(live, built);
const added = urls.filter((u) => !(u in live)).map((u) => u.slice(SITE.length) || "/");
const summary = !urls.length
  ? "nothing new"
  : added.length && added.length <= 3
    ? `${added.join(", ")} ${added.length === 1 ? "goes" : "go"} live`
    : `${urls.length} page(s) changed`;

console.log(urls.length ? `Build differs from the live site: ${summary}\n  ${urls.join("\n  ")}` : "Build matches the live site.");
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${urls.length > 0}\nsummary=${summary}\n`);
}
