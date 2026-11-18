/**
 * Audits the built site (dist/) against the rules in seo/lib/rules.mjs and
 * writes dist/seo-manifest.json, a content hash per indexable URL that the
 * daily job uses to tell what changed. Runs as part of `npm run build`, so a
 * page that breaks a rule never deploys.
 *
 *   node seo/audit.mjs            exit 1 on any error
 *   node seo/audit.mjs --no-fail  report only
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { ANSWER_BOTS, DIST, HOST, LLMS_EXEMPT, MANIFEST, SITE, STALE_AFTER_DAYS, TRAINING_BOTS, torontoToday } from "./config.mjs";
import { contentHash, parsePage, pathFromFile } from "./lib/page.mjs";
import { runRules, staleDates, WHY } from "./lib/rules.mjs";
import { readLedger } from "./links/policy.mjs";

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function sitemapUrls() {
  const index = join(DIST, "sitemap-index.xml");
  if (!existsSync(index)) return [];
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locs(readFileSync(index, "utf8")).flatMap((url) => {
    const file = join(DIST, new URL(url).pathname);
    return existsSync(file) ? locs(readFileSync(file, "utf8")) : [];
  });
}

/** Frontmatter dates per content file: which are stale, which are still to come. */
function contentDates(today) {
  const stale = [];
  const scheduled = [];
  const read = (section, field) => {
    const dir = `src/content/${section}`;
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
      .flatMap((file) => {
        const text = readFileSync(join(dir, file), "utf8");
        if (/^draft:\s*true/m.test(text)) return [];
        const m = text.match(new RegExp(`^${field}:\\s*"?(\\d{4}-\\d{2}-\\d{2})`, "m"));
        return m ? [{ path: `/${section === "comparisons" ? "vs" : section}/${file.replace(/\.mdx?$/, "")}`, field, date: m[1] }] : [];
      });
  };
  stale.push(...staleDates(read("restaurants", "checked"), STALE_AFTER_DAYS.restaurants, today));
  stale.push(...staleDates(read("comparisons", "verified"), STALE_AFTER_DAYS.comparisons, today));
  for (const entry of [...read("blog", "pubDate"), ...read("restaurants", "publishOn")]) {
    if (entry.date > today) scheduled.push(entry);
  }
  return { stale, scheduled: scheduled.sort((a, b) => a.date.localeCompare(b.date)) };
}

function main() {
  if (!existsSync(DIST)) {
    console.error(`No ${DIST}/ to audit. Run the build first.`);
    process.exit(1);
  }
  const today = torontoToday();
  const all = listFiles(DIST);
  const pages = all
    .filter((f) => f.endsWith(".html"))
    .map((f) => parsePage(readFileSync(f, "utf8"), pathFromFile(relative(DIST, f))));
  const files = new Set(all.filter((f) => !f.endsWith(".html")).map((f) => "/" + relative(DIST, f).replace(/\\/g, "/")));
  const ledger = readLedger();
  const read = (name) => (existsSync(join(DIST, name)) ? readFileSync(join(DIST, name), "utf8") : "");

  const { stale, scheduled } = contentDates(today);
  const findings = [
    ...runRules({
      pages,
      files,
      sitemapUrls: sitemapUrls(),
      robotsTxt: read("robots.txt"),
      llmsTxt: read("llms.txt"),
      linkTargets: ledger.prospects,
      allowOutbound: ledger.allowOutbound,
      config: {
        site: SITE,
        host: HOST,
        answerBots: ANSWER_BOTS,
        trainingBots: TRAINING_BOTS,
        llmsExempt: LLMS_EXEMPT,
        // worker/index.js answers these; they are not files in dist.
        servedByWorker: ["/sitemap.xml", "/api/food-request"],
      },
      today,
    }),
    ...stale,
  ];

  const indexable = pages.filter((p) => !p.noindex).sort((a, b) => a.path.localeCompare(b.path));
  const manifest = Object.fromEntries(indexable.map((p) => [p.path === "/" ? SITE : SITE + p.path, contentHash(p)]));
  writeFileSync(join(DIST, MANIFEST), JSON.stringify({ pages: manifest }, null, 2) + "\n");

  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warn");
  console.log(`\nSEO audit: ${pages.length} pages (${indexable.length} indexable), ${errors.length} errors, ${warnings.length} warnings`);
  for (const [label, list] of [["ERROR", errors], ["warn", warnings]]) {
    const rules = [...new Set(list.map((f) => f.rule))];
    for (const rule of rules) {
      console.log(`\n${label}  ${rule}  (${WHY[rule]})`);
      for (const f of list.filter((x) => x.rule === rule)) console.log(`  ${f.path}  ${f.message}`);
    }
  }
  if (scheduled.length) {
    console.log("\nScheduled, not built yet:");
    for (const s of scheduled) console.log(`  ${s.date}  ${s.path}`);
  }
  console.log("");
  if (errors.length && !process.argv.includes("--no-fail")) process.exit(1);
}

main();
