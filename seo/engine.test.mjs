import { describe, expect, it } from "vitest";
import { contentHash, parsePage, pathFromFile } from "./lib/page.mjs";
import { botAllowed, runRules, staleDates } from "./lib/rules.mjs";
import { ledgerProblems, priceSigns } from "./links/policy.mjs";
import { changedUrls } from "./indexnow.mjs";
import { actionsEmail, channelOf, nearMisses, summarise } from "./measure.mjs";

const SITE = "https://pocketchomp.com";
const config = { site: SITE, host: "pocketchomp.com", answerBots: ["Googlebot", "OAI-SearchBot"], trainingBots: ["GPTBot"], llmsExempt: [] };
const words = Array.from({ length: 130 }, (_, n) => `word${n}`).join(" ");

function html({ path, title = `Title ${path}`, description = `A description of ${path} that is long enough to pass the length check.`, head = "", body = "", canonical }) {
  const url = canonical ?? (path === "/" ? `${SITE}/` : SITE + path);
  return `<!doctype html><html lang="en-CA"><head><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${url}">${head}</head><body><main><h1>${title}</h1><p>${words}</p>${body}</main></body></html>`;
}

function audit(specs, extra = {}) {
  const pages = specs.map((s) => parsePage(html(s), s.path));
  return runRules({
    pages,
    files: new Set(),
    sitemapUrls: pages.filter((p) => !p.noindex).map((p) => (p.path === "/" ? SITE : SITE + p.path)),
    robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://pocketchomp.com/sitemap-index.xml",
    llmsTxt: pages.map((p) => `- [x](${p.path === "/" ? SITE : SITE + p.path}): note`).join("\n"),
    linkTargets: [],
    allowOutbound: [],
    config,
    today: "2026-11-16",
    ...extra,
  });
}

const home = { path: "/", body: '<a href="/tools">Tools</a>' };
const tools = { path: "/tools", body: '<a href="/">Home</a>' };
const rulesHit = (findings, level = "error") => findings.filter((f) => f.level === level).map((f) => f.rule);

describe("page", () => {
  it("maps built files to paths", () => {
    expect(pathFromFile("index.html")).toBe("/");
    expect(pathFromFile("tools\\tdee-calculator\\index.html")).toBe("/tools/tdee-calculator");
    expect(pathFromFile("404.html")).toBe("/404");
  });

  it("hashes what a reader sees, not the markup around it", () => {
    const a = parsePage(html({ path: "/a" }), "/a");
    const b = parsePage(html({ path: "/a", head: '<link rel="stylesheet" href="/_astro/x.123.css">' }), "/a");
    const c = parsePage(html({ path: "/a", body: "<p>One new sentence.</p>" }), "/a");
    expect(contentHash(a)).toBe(contentHash(b));
    expect(contentHash(a)).not.toBe(contentHash(c));
  });
});

describe("rules", () => {
  it("passes a clean two-page site", () => {
    expect(audit([home, tools])).toEqual([]);
  });

  it("catches a broken link, an orphan and a duplicate title", () => {
    const findings = audit([{ ...home, body: '<a href="/gone">x</a>' }, { ...tools, title: "Title /" }]);
    expect(rulesHit(findings).sort()).toEqual(["link", "orphan", "title"]);
  });

  it("catches a wrong canonical and a page missing from the sitemap", () => {
    expect(rulesHit(audit([home, tools], { sitemapUrls: [SITE] }))).toEqual(["sitemap"]);
    expect(rulesHit(audit([home, { ...tools, canonical: `${SITE}/tools/` }]))).toEqual([]);
    expect(rulesHit(audit([home, { ...tools, canonical: `${SITE}/calculators` }]))).toEqual(["canonical"]);
  });

  it("keeps noindex pages out of the sitemap and out of the orphan check", () => {
    const thanks = { path: "/thanks", head: '<meta name="robots" content="noindex">' };
    expect(audit([home, tools, thanks], { sitemapUrls: [SITE, `${SITE}/tools`] })).toEqual([]);
    expect(rulesHit(audit([home, tools, thanks], { sitemapUrls: [SITE, `${SITE}/tools`, `${SITE}/thanks`] }))).toEqual(["sitemap"]);
  });

  it("requires FAQ markup to match the page", () => {
    const ld = (q, a) => `<script type="application/ld+json">${JSON.stringify({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }] })}</script>`;
    const visible = "<h2>Is it free?</h2><p>Yes, the basics are.</p>";
    expect(audit([home, { ...tools, body: tools.body + visible + ld("Is it free?", "Yes, the basics are.") }])).toEqual([]);
    expect(rulesHit(audit([home, { ...tools, body: tools.body + visible + ld("Is it free?", "Completely.") }]))).toEqual(["jsonld"]);
  });

  it("rejects a date in the future and a blocked snippet", () => {
    const future = `<script type="application/ld+json">{"@type":"BlogPosting","dateModified":"2026-12-01"}</script>`;
    expect(rulesHit(audit([home, { ...tools, body: tools.body + future }]))).toEqual(["date"]);
    expect(rulesHit(audit([home, { ...tools, head: '<meta name="robots" content="nosnippet">' }]))).toEqual(["snippet"]);
  });

  it("never lets the site link back to a site in the link ledger", () => {
    const linked = { ...tools, body: tools.body + '<a href="https://www.example-blog.ca/apps">a blog</a>' };
    expect(rulesHit(audit([home, linked], { linkTargets: [{ domain: "example-blog.ca" }] }))).toEqual(["exchange"]);
    expect(audit([home, linked], { linkTargets: [{ domain: "example-blog.ca" }], allowOutbound: [{ domain: "example-blog.ca" }] })).toEqual([]);
    expect(audit([home, linked])).toEqual([]);
  });

  it("reads robots.txt per crawler", () => {
    const robots = "User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: GPTBot\nDisallow: /";
    expect(botAllowed(robots, "Googlebot")).toBe(true);
    expect(botAllowed(robots, "OAI-SearchBot")).toBe(false);
    const findings = audit([home, tools], { robotsTxt: robots });
    expect(rulesHit(findings)).toEqual(["robots"]);
    expect(rulesHit(findings, "warn")).toEqual(["robots", "robots"]);
  });

  it("flags a checked date that has gone stale", () => {
    const entries = [{ path: "/restaurants/a", field: "checked", date: "2026-06-01" }, { path: "/restaurants/b", field: "checked", date: "2026-11-01" }];
    expect(staleDates(entries, 120, "2026-11-16").map((f) => f.path)).toEqual(["/restaurants/a"]);
  });
});

describe("link policy", () => {
  const good = { domain: "example.ca", page: "https://example.ca/apps", type: "resource-page", status: "found", target: "/", why: "lists Canadian apps" };

  it("accepts a well-formed prospect", () => {
    expect(ledgerProblems({ prospects: [good], allowOutbound: [] })).toEqual([]);
  });

  it("refuses to keep a site that asked for something in return", () => {
    expect(ledgerProblems({ prospects: [{ ...good, asksForReturn: true }], allowOutbound: [] })).toHaveLength(1);
    expect(ledgerProblems({ prospects: [{ ...good, asksForReturn: true, status: "dropped", dropReason: "wanted a link back" }], allowOutbound: [] })).toEqual([]);
  });

  it("spots a price on a page", () => {
    expect(priceSigns("We accept sponsored posts. Contact us for advertising rates.")).toContain("sells placements");
    expect(priceSigns("Happy to do a link exchange with similar sites.")).toContain("asks for a link in return");
    expect(priceSigns("Apps our dietitians recommend to clients.")).toEqual([]);
  });
});

describe("indexnow", () => {
  it("submits new, changed and removed URLs only", () => {
    const before = { a: "1", b: "1", c: "1" };
    const after = { a: "1", b: "2", d: "1" };
    expect(changedUrls(before, after)).toEqual(["b", "c", "d"]);
  });
});

describe("measure", () => {
  it("sorts referrers into channels", () => {
    expect(["Google", "chatgpt.com", "Reddit", "Direct / None", "perplexity.ai"].map(channelOf)).toEqual(["search", "ai", "referral", "direct", "ai"]);
  });

  it("totals visitors by channel and landing page", () => {
    const s = summarise([
      { source: "Google", page: "/", visitors: 3 },
      { source: "chatgpt.com", page: "/", visitors: 19 },
      { source: "chatgpt.com", page: "/blog/x", visitors: 4 },
      { source: "Direct / None", page: "/", visitors: 200 },
    ]);
    expect(s.channels).toEqual({ search: 3, ai: 23, referral: 0, direct: 200 });
    expect(s.pages["/"]).toEqual({ search: 3, ai: 19 });
  });

  it("keeps only searches within reach", () => {
    const rows = [
      { query: "top", position: 1.2, impressions: 90 },
      { query: "near", position: 12, impressions: 40 },
      { query: "far", position: 61, impressions: 300 },
      { query: "rare", position: 9, impressions: 2 },
    ];
    expect(nearMisses(rows).map((r) => r.query)).toEqual(["near"]);
  });

  it("emails nothing when there is nothing to do", () => {
    expect(actionsEmail("2026-11-23", [], [])).toBe("");
  });

  it("emails only the to-do", () => {
    const text = actionsEmail("2026-11-23", [["reddit.com", 3]], [{ query: "tims nutrition", page: "/restaurants/tim-hortons", position: 8.2, impressions: 40, clicks: 1 }]);
    expect(text.split("\n")[0]).toBe("# SEO to-do, 2026-11-23");
    expect(text).toContain('- "tims nutrition" on /restaurants/tim-hortons: position 8.2, 40 impressions, 1 clicks');
    expect(text).toContain("- reddit.com (3 this week)");
    expect(text).not.toContain("Visitors, last 28 days");
  });
});
