/**
 * Weekly DataForSEO snapshot collector for pocketchomp.com.
 *
 * Read-only: queries DataForSEO's low-cost live endpoints for Canada (2124),
 * compares against the previous snapshot in <state-dir>/dfs/, and writes
 * <state-dir>/dfs/<date>.json + <state-dir>/dfs-report.md.
 *
 *   node seo/dfs-weekly.mjs [--state-dir .seo-state] [--ai] [--quiet]
 *
 * Needs DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in the environment or .env.
 * Estimated cost: ~$0.10/run (~$0.40/month weekly); add --ai bi-weekly (~$0.20)
 * to include Google AI Overview LLM Mentions target metrics.
 *
 * Security: never commit .seo-state/ to the public repo.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HOST, torontoToday } from "./config.mjs";
import { env } from "./measure.mjs";

const API = "https://api.dataforseo.com";
const CA = 2124;

export const CORE_KEYWORDS = [
  "myfitnesspal alternative canada",
  "best free calorie counter app canada",
  "myfitnesspal canada",
  "canadian nutrient file",
  "mcdonalds canada nutrition",
  "tim hortons nutrition",
  "protein calculator",
  "maintenance calorie calculator",
  "calorie counter canada",
  "pocketchomp",
];

function parseArgs(argv) {
  const idx = argv.indexOf("--state-dir");
  return {
    stateDir: idx > 0 ? argv[idx + 1] : ".seo-state",
    includeAi: argv.includes("--ai"),
    quiet: argv.includes("--quiet"),
  };
}

async function dfsPost(authHeader, path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status_code >= 40000) {
    throw new Error(`DataForSEO ${path} failed (${res.status} / ${json.status_code}): ${json.status_message ?? "unknown"}`);
  }
  const task = json.tasks?.[0];
  if (!task || task.status_code >= 40000) {
    throw new Error(`DataForSEO task ${path} failed (${task?.status_code}): ${task?.status_message ?? "unknown"}`);
  }
  return { result: task.result?.[0] ?? {}, cost: task.cost ?? 0 };
}

/** Pure diff + markdown formatter so the weekly report logic is unit-testable. */
export function formatDfsReport(current, previous) {
  const delta = (now, prev) => {
    if (prev == null || now == null) return "";
    const d = Math.round((now - prev) * 10) / 10;
    return d === 0 ? " (0)" : d > 0 ? ` (+${d})` : ` (${d})`;
  };

  const lines = [`# PocketChomp Weekly SEO Report (${current.date})`, ""];
  const o = current.overview ?? {};
  const po = previous?.overview;
  lines.push(
    "## Canada Organic Overview",
    "",
    `- Ranked keywords: **${o.count ?? 0}**${delta(o.count, po?.count)}`,
    `- Top 10: **${o.top10 ?? 0}**${delta(o.top10, po?.top10)} · Pos 11–20: **${o.pos_11_20 ?? 0}**${delta(o.pos_11_20, po?.pos_11_20)} · Pos 21–30: **${o.pos_21_30 ?? 0}**${delta(o.pos_21_30, po?.pos_21_30)}`,
    `- Est. monthly organic traffic (ETV): **${o.etv ?? 0}**${delta(o.etv, po?.etv)}`,
    "",
  );

  const bl = current.backlinks ?? {};
  const pbl = previous?.backlinks;
  lines.push(
    "## Backlinks & Spam Health",
    "",
    `- Referring main domains: **${bl.referring_main_domains ?? 0}**${delta(bl.referring_main_domains, pbl?.referring_main_domains)} (rank ${bl.rank ?? 0})`,
    `- Backlinks spam score: **${bl.backlinks_spam_score ?? 0}%**${delta(bl.backlinks_spam_score, pbl?.backlinks_spam_score)}`,
  );
  if (current.newReferringDomains?.length) {
    lines.push("", "Newest referring domains:", ...current.newReferringDomains.map((d) => `- ${d.domain} (rank ${d.rank ?? 0}, spam ${d.spam ?? 0}%, seen ${d.first_seen?.slice(0, 10) ?? "?"})`));
  }
  lines.push("");

  if (current.serpChecks?.length) {
    lines.push("## Core Canadian SERP & AI Overview Tracker", "", "| Keyword | Organic Pos | In AI Overview? | Ranking URL |", "|---|---:|---|---|");
    for (const s of current.serpChecks) {
      lines.push(`| ${s.keyword} | ${s.rank ?? "—"} | ${s.inAiOverview ? "YES" : s.hasAiOverview ? "No (AIO present)" : "No AIO"} | ${s.url ?? "—"} |`);
    }
    lines.push("");
  }

  if (current.strikingDistance?.length) {
    lines.push("## Striking-Distance Keywords (Pos 4–30)", "", "| Keyword | Pos | SV | KD | Page |", "|---|---:|---:|---:|---|");
    for (const k of current.strikingDistance) {
      lines.push(`| ${k.keyword} | ${k.rank} | ${k.sv ?? 0} | ${k.kd ?? "—"} | ${k.url} |`);
    }
    lines.push("");
  }

  if (current.aiMentions) {
    lines.push("## AI Mentions (Google AIO, Canada)", "", `- Mentions: **${current.aiMentions.total_count ?? 0}**`, "");
  }

  lines.push(`*Total DataForSEO API cost for this run: $${(current.cost ?? 0).toFixed(4)} USD*`, "");
  return lines.join("\n");
}

function loadPrevious(dir, today) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f < `${today}.json`)
    .sort();
  if (!files.length) return null;
  return JSON.parse(readFileSync(join(dir, files[files.length - 1]), "utf8"));
}

async function main() {
  const { stateDir, includeAi, quiet } = parseArgs(process.argv);
  const login = env("DATAFORSEO_LOGIN");
  const password = env("DATAFORSEO_PASSWORD");
  if (!login || !password) {
    console.log("DataForSEO: DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD not set in env or .env. Skipping.");
    return;
  }

  const auth = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
  const today = torontoToday();
  let cost = 0;

  const [ov, rk, bl, rd] = await Promise.all([
    dfsPost(auth, "/v3/dataforseo_labs/google/domain_rank_overview/live", [{ target: HOST, location_code: CA, language_code: "en" }]),
    dfsPost(auth, "/v3/dataforseo_labs/google/ranked_keywords/live", [{ target: HOST, location_code: CA, language_code: "en", limit: 100 }]),
    dfsPost(auth, "/v3/backlinks/summary/live", [{ target: HOST, include_subdomains: true }]),
    dfsPost(auth, "/v3/backlinks/referring_domains/live", [{ target: HOST, limit: 10, order_by: ["first_seen,desc"] }]),
  ]);
  cost += ov.cost + rk.cost + bl.cost + rd.cost;

  const org = ov.result.items?.[0]?.metrics?.organic ?? {};
  const top10 = (org.pos_1 ?? 0) + (org.pos_2_3 ?? 0) + (org.pos_4_10 ?? 0);

  const strikingDistance = (rk.result.items ?? [])
    .map((it) => ({
      keyword: it.keyword_data?.keyword,
      rank: it.ranked_serp_element?.serp_item?.rank_group,
      sv: it.keyword_data?.keyword_info?.search_volume ?? 0,
      kd: it.keyword_data?.keyword_properties?.keyword_difficulty ?? null,
      url: it.ranked_serp_element?.serp_item?.relative_url ?? "/",
    }))
    .filter((k) => k.rank >= 4 && k.rank <= 30)
    .sort((a, b) => a.rank - b.rank || b.sv - a.sv)
    .slice(0, 25);

  const serpChecks = [];
  for (const keyword of CORE_KEYWORDS) {
    const s = await dfsPost(auth, "/v3/serp/google/organic/live/advanced", [{ keyword, location_code: CA, language_code: "en", depth: 30 }]);
    cost += s.cost;
    const items = s.result.items ?? [];
    const hit = items.find(
      (it) =>
        it.type === "organic" &&
        (it.domain === HOST || it.website_name === HOST || it.breadcrumb?.includes(HOST) || it.url?.includes(`://${HOST}`)),
    );
    const aio = items.find((it) => it.type === "ai_overview");
    const inAiOverview = Boolean(
      aio?.references?.some((r) => r.domain === HOST || r.source === HOST || r.url?.includes(HOST)) ||
      aio?.markdown?.toLowerCase().includes("pocketchomp"),
    );
    const rankedUrl = hit?.url?.includes(`://${HOST}`)
      ? hit.url.replace(`https://${HOST}`, "") || "/"
      : hit?.breadcrumb?.replace(/^https?:\/\//, "").replace(HOST, "").replace(/\s*›\s*/g, "/") || (hit ? "/" : null);
    serpChecks.push({
      keyword,
      rank: hit?.rank_group ?? null,
      url: rankedUrl,
      hasAiOverview: Boolean(aio),
      inAiOverview,
    });
  }

  let aiMentions = null;
  if (includeAi) {
    const ai = await dfsPost(auth, "/v3/ai_optimization/llm_mentions/target_metrics/live", [
      { target: [{ domain: HOST, search_filter: "include" }], platform: "google", location_code: CA, language_code: "en" },
    ]);
    cost += ai.cost;
    aiMentions = { total_count: ai.result.total_count ?? 0 };
  }

  const snapshot = {
    date: today,
    cost,
    overview: {
      count: org.count ?? 0,
      top10,
      pos_11_20: org.pos_11_20 ?? 0,
      pos_21_30: org.pos_21_30 ?? 0,
      etv: Math.round((org.etv ?? 0) * 10) / 10,
    },
    backlinks: {
      rank: bl.result.rank ?? 0,
      backlinks: bl.result.backlinks ?? 0,
      referring_main_domains: bl.result.referring_main_domains ?? 0,
      backlinks_spam_score: bl.result.backlinks_spam_score ?? 0,
    },
    newReferringDomains: (rd.result.items ?? []).map((d) => ({
      domain: d.domain,
      rank: d.rank ?? 0,
      spam: d.backlinks_spam_score ?? 0,
      first_seen: d.first_seen,
    })),
    strikingDistance,
    serpChecks,
    aiMentions,
  };

  const dfsDir = join(stateDir, "dfs");
  mkdirSync(dfsDir, { recursive: true });
  const prev = loadPrevious(dfsDir, today);
  const md = formatDfsReport(snapshot, prev);

  writeFileSync(join(dfsDir, `${today}.json`), JSON.stringify(snapshot, null, 2) + "\n");
  writeFileSync(join(stateDir, "dfs-report.md"), md);
  if (!quiet) console.log(md);
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("seo/dfs-weekly.mjs")) {
  main().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
