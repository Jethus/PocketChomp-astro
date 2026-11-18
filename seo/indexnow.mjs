/**
 * Tells IndexNow (Bing, and through Bing the answer engines that search with
 * it) which URLs changed. It compares the live site's seo-manifest.json with
 * the manifest it last submitted, so it sends only what changed, whether the
 * change arrived by a push or by the daily release.
 *
 *   node seo/indexnow.mjs                      submit what changed since last time
 *   node seo/indexnow.mjs --dry-run            print, send nothing
 *   node seo/indexnow.mjs --wait-for dist/seo-manifest.json
 *                                              first wait until the live site serves that build
 * State: <state-dir>/indexnow.json (default .seo-state/, or --state-dir).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HOST, INDEXNOW_ENDPOINT, INDEXNOW_KEY, MANIFEST, SITE } from "./config.mjs";

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const dryRun = process.argv.includes("--dry-run");
const stateDir = arg("--state-dir") ?? ".seo-state";
const stateFile = join(stateDir, "indexnow.json");

async function liveManifest() {
  const res = await fetch(`${SITE}/${MANIFEST}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()).pages;
}

/** URLs that are new, changed or gone between two manifests. */
export function changedUrls(before, after) {
  const urls = new Set();
  for (const [url, hash] of Object.entries(after)) if (before[url] !== hash) urls.add(url);
  for (const url of Object.keys(before)) if (!(url in after)) urls.add(url);
  return [...urls].sort();
}

async function waitFor(file) {
  const want = JSON.stringify(JSON.parse(readFileSync(file, "utf8")).pages);
  for (let attempt = 0; attempt < 40; attempt++) {
    const live = await liveManifest();
    if (live && JSON.stringify(live) === want) return true;
    await new Promise((r) => setTimeout(r, 30_000));
  }
  return false;
}

async function main() {
  const waitFile = arg("--wait-for");
  if (waitFile && !(await waitFor(waitFile))) {
    console.error("The live site never matched the build (20 minutes). Nothing submitted; tomorrow's run will catch up.");
    process.exit(1);
  }
  const live = await liveManifest();
  if (!live) {
    console.log(`${SITE}/${MANIFEST} is not live yet. Nothing to submit.`);
    return;
  }
  const submitted = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")).pages : {};
  const urls = changedUrls(submitted, live);
  if (!urls.length) {
    console.log("IndexNow: nothing changed since the last submission.");
    return;
  }
  console.log(`IndexNow: ${urls.length} URL(s) changed:\n  ${urls.join("\n  ")}`);
  if (dryRun) return;

  const key = await fetch(`${SITE}/${INDEXNOW_KEY}.txt`);
  if (!key.ok || (await key.text()).trim() !== INDEXNOW_KEY) {
    console.error(`The key file ${SITE}/${INDEXNOW_KEY}.txt is not live. Nothing submitted.`);
    process.exit(1);
  }
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls }),
  });
  // 200 = accepted, 202 = accepted, key check pending. Anything else is a refusal.
  if (res.status !== 200 && res.status !== 202) {
    console.error(`IndexNow refused the submission: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(stateFile, JSON.stringify({ submittedAt: new Date().toISOString(), pages: live }, null, 2) + "\n");
  console.log(`IndexNow accepted them (HTTP ${res.status}).`);
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("seo/indexnow.mjs")) await main();
