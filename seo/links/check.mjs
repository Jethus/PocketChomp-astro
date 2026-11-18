/**
 * Visits every open prospect in seo/links/prospects.json and reports three
 * things: who links to us now, who stopped, and whose page shows a price
 * (seo/links/policy.mjs), which means we drop them. It never edits the
 * ledger and never contacts anyone; it only reads public pages.
 *
 *   node seo/links/check.mjs [--state-dir .seo-state]
 * Writes <state-dir>/links.json.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HOST } from "../config.mjs";
import { parsePage } from "../lib/page.mjs";
import { ledgerProblems, priceSigns, readLedger } from "./policy.mjs";

const i = process.argv.indexOf("--state-dir");
const stateDir = i > 0 ? process.argv[i + 1] : ".seo-state";
// A plain browser-style agent: the request names neither the project nor a person.
const UA = "Mozilla/5.0 (compatible; link-check/1.0)";

async function visit(prospect) {
  try {
    const res = await fetch(prospect.page, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20_000), redirect: "follow" });
    if (!res.ok) return { http: res.status, linksToUs: [], priceSigns: [] };
    const page = parsePage(await res.text(), "/");
    const linksToUs = page.links
      .filter((l) => {
        try {
          return new URL(l.href, prospect.page).hostname.replace(/^www\./, "") === HOST;
        } catch {
          return false;
        }
      })
      .map((l) => ({ href: l.href, text: l.text.slice(0, 80), followed: !/nofollow|sponsored|ugc/.test(l.rel) }));
    return { http: res.status, linksToUs, priceSigns: priceSigns(page.text) };
  } catch (error) {
    return { http: 0, error: error.name === "TimeoutError" ? "timed out" : error.message, linksToUs: [], priceSigns: [] };
  }
}

const ledger = readLedger();
const problems = ledgerProblems(ledger);
if (problems.length) {
  console.error(`The link ledger breaks its own rules:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

const open = ledger.prospects.filter((p) => !["dropped", "declined"].includes(p.status));
const results = {};
const notes = [];
for (const prospect of open) {
  const r = (results[prospect.domain] = await visit(prospect));
  if (r.linksToUs.length && prospect.status !== "live") notes.push(`NEW LINK   ${prospect.domain} links to us (${r.linksToUs[0].followed ? "followed" : "nofollow"}). Set its status to "live".`);
  if (!r.linksToUs.length && prospect.status === "live") notes.push(`LOST       ${prospect.domain} no longer links to us (HTTP ${r.http}).`);
  if (r.priceSigns.length) notes.push(`DROP?      ${prospect.domain} ${r.priceSigns.join("; ")}. Read the page; if it is true, drop it.`);
  if (r.http !== 200) notes.push(`UNREACHED  ${prospect.domain} (${r.error ?? `HTTP ${r.http}`})`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

mkdirSync(stateDir, { recursive: true });
writeFileSync(join(stateDir, "links.json"), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + "\n");

const count = (status) => ledger.prospects.filter((p) => p.status === status).length;
console.log(`Link ledger: ${ledger.prospects.length} sites. live ${count("live")}, pitched ${count("pitched")}, qualified ${count("qualified")}, found ${count("found")}, declined ${count("declined")}, dropped ${count("dropped")}.`);
console.log(notes.length ? notes.join("\n") : "No changes.");
