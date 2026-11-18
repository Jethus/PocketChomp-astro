/**
 * The feedback loop: who arrived from a search engine or an AI assistant in
 * the last 28 days, which sites sent visitors for the first time (a new link
 * or mention), and, when Search Console access is set up, which searches the
 * site almost ranks for. Read-only; it writes a report and changes nothing.
 *
 *   node seo/measure.mjs [--state-dir .seo-state]
 * Needs PLAUSIBLE_CE (Stats API key; read from the environment or .env).
 * Optional: GSC_SERVICE_ACCOUNT (a Google service-account JSON key, as one
 * string, added as a user on the Search Console property) and GSC_SITE
 * (default "sc-domain:pocketchomp.com").
 * Writes <state-dir>/report.md, <state-dir>/reports/<date>.json and
 * <state-dir>/referrers.json (every referrer seen so far).
 */
import { createSign } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AI_SOURCES, HOST, SEARCH_SOURCES, torontoToday } from "./config.mjs";

const PLAUSIBLE = "https://data.pixelboost.dev/api/v2/query";
const i = process.argv.indexOf("--state-dir");
const stateDir = i > 0 ? process.argv[i + 1] : ".seo-state";

function env(name) {
  if (process.env[name]) return process.env[name];
  if (!existsSync(".env")) return undefined;
  const line = readFileSync(".env", "utf8").split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).replace(/^["']|["']$/g, "");
}

const day = (offset) => new Date(Date.parse(torontoToday()) - offset * 86_400_000).toISOString().slice(0, 10);

async function plausible(key, range) {
  const res = await fetch(PLAUSIBLE, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      site_id: HOST,
      metrics: ["visitors"],
      date_range: range,
      dimensions: ["visit:source", "visit:entry_page"],
      pagination: { limit: 1000 },
    }),
  });
  if (!res.ok) throw new Error(`Plausible answered HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()).results.map((r) => ({ source: r.dimensions[0], page: r.dimensions[1], visitors: r.metrics[0] }));
}

export const channelOf = (source) =>
  AI_SOURCES.test(source) ? "ai" : SEARCH_SOURCES.test(source) ? "search" : /^direct/i.test(source) ? "direct" : "referral";

/** Visitors per channel, and per entry page within search and AI. */
export function summarise(rows) {
  const channels = { search: 0, ai: 0, referral: 0, direct: 0 };
  const pages = {};
  const sources = {};
  for (const row of rows) {
    const channel = channelOf(row.source);
    channels[channel] += row.visitors;
    if (channel === "direct") continue;
    sources[row.source] = (sources[row.source] ?? 0) + row.visitors;
    if (channel === "referral") continue;
    const page = (pages[row.page] ??= { search: 0, ai: 0 });
    page[channel] += row.visitors;
  }
  return { channels, pages, sources };
}

async function searchConsole(keyJson, site) {
  const key = JSON.parse(keyJson);
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 600,
  })}`;
  const assertion = `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url")}`;
  const token = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!token.ok) throw new Error(`Google refused the service account: HTTP ${token.status} ${await token.text()}`);
  const { access_token } = await token.json();
  // Search Console data settles about three days behind.
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate: day(31), endDate: day(3), dimensions: ["query", "page"], rowLimit: 5000 }),
  });
  if (!res.ok) throw new Error(`Search Console answered HTTP ${res.status}: ${await res.text()}`);
  return ((await res.json()).rows ?? []).map((r) => ({
    query: r.keys[0],
    page: r.keys[1].replace(`https://${HOST}`, "") || "/",
    clicks: r.clicks,
    impressions: r.impressions,
    position: Math.round(r.position * 10) / 10,
  }));
}

/** Searches where the site already shows on pages 1 to 3: the cheapest wins to chase. */
export function nearMisses(rows) {
  return rows
    .filter((r) => r.position >= 4 && r.position <= 30 && r.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);
}

async function main() {
  const today = torontoToday();
  const lines = [`# SEO report, ${today}`, ""];
  const report = { date: today };

  const key = env("PLAUSIBLE_CE");
  if (!key) {
    lines.push("Plausible: PLAUSIBLE_CE is not set, so there are no visitor numbers.", "");
  } else {
    const [now, before] = await Promise.all([plausible(key, [day(28), day(1)]), plausible(key, [day(56), day(29)])]);
    const current = summarise(now);
    const previous = summarise(before);
    report.visitors = { current: current.channels, previous: previous.channels, pages: current.pages };
    lines.push("## Visitors, last 28 days (previous 28 in brackets)", "");
    for (const [name, label] of [["search", "Search engines"], ["ai", "AI assistants"], ["referral", "Other sites"], ["direct", "Direct"]]) {
      lines.push(`- ${label}: ${current.channels[name]} (${previous.channels[name]})`);
    }
    const landing = Object.entries(current.pages).sort((a, b) => b[1].search + b[1].ai - (a[1].search + a[1].ai));
    if (landing.length) {
      lines.push("", "Landing pages from search and AI:", "");
      for (const [page, n] of landing.slice(0, 15)) lines.push(`- ${page}: ${n.search} search, ${n.ai} AI`);
    }

    const seenFile = join(stateDir, "referrers.json");
    const firstRun = !existsSync(seenFile);
    const seen = firstRun ? {} : JSON.parse(readFileSync(seenFile, "utf8"));
    const fresh = Object.keys(current.sources).filter((s) => !(s in seen));
    for (const source of fresh) seen[source] = today;
    report.newReferrers = firstRun ? [] : fresh;
    report.seenReferrers = seen;
    if (!firstRun && fresh.length) {
      lines.push("", "## Sites sending visitors for the first time", "", ...fresh.map((s) => `- ${s} (${current.sources[s]})`), "", "Each one is a new link or mention. Find the page and add it to seo/links/prospects.json as live.");
    }
    lines.push("");
  }

  const gscKey = env("GSC_SERVICE_ACCOUNT");
  if (!gscKey) {
    lines.push("Search Console: GSC_SERVICE_ACCOUNT is not set, so there is no search-query data (seo/README.md, Setup).", "");
  } else {
    const rows = await searchConsole(gscKey, env("GSC_SITE") ?? `sc-domain:${HOST}`);
    const misses = nearMisses(rows);
    report.search = {
      clicks: rows.reduce((n, r) => n + r.clicks, 0),
      impressions: rows.reduce((n, r) => n + r.impressions, 0),
      nearMisses: misses,
    };
    lines.push("## Google Search, last 28 days", "", `${report.search.clicks} clicks, ${report.search.impressions} impressions.`, "");
    if (misses.length) {
      lines.push("Searches the site almost ranks for (position 4 to 30):", "", "| Search | Page | Position | Impressions | Clicks |", "|---|---|---:|---:|---:|");
      for (const r of misses) lines.push(`| ${r.query} | ${r.page} | ${r.position} | ${r.impressions} | ${r.clicks} |`);
      lines.push("");
    }
  }

  mkdirSync(join(stateDir, "reports"), { recursive: true });
  writeFileSync(join(stateDir, "reports", `${today}.json`), JSON.stringify(report, null, 2) + "\n");
  writeFileSync(join(stateDir, "report.md"), lines.join("\n"));
  if (report.seenReferrers) writeFileSync(join(stateDir, "referrers.json"), JSON.stringify(report.seenReferrers, null, 2) + "\n");
  console.log(lines.join("\n"));
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("seo/measure.mjs")) await main();
