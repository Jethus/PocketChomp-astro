/**
 * The audit rules. Pure: built pages in, findings out. Each rule names the
 * published guidance it enforces (WHY), so nothing here is folklore. An
 * "error" fails the build; a "warn" is printed and left to judgement.
 */
import { jsonldNodes } from "./page.mjs";

const G = "developers.google.com/search/docs";
export const WHY = {
  "title": `${G}/appearance/title-link: unique, clear, concise, accurate`,
  "description": `${G}/appearance/snippet: short, unique to the page`,
  "canonical": `${G}/crawling-indexing/consolidate-duplicate-urls: one URL per piece of content`,
  "h1": "Readers and screen readers; Google itself does not require an h1",
  "link": `${G}/crawling-indexing/links-crawlable: Google finds pages through links`,
  "orphan": `${G}/appearance/ai-features: content must be findable through internal links`,
  "sitemap": `${G}/crawling-indexing/sitemaps/overview: list the URLs you want indexed, and only those`,
  "jsonld": `${G}/appearance/structured-data/sd-policies: markup must match the visible page`,
  "date": `${G}/fundamentals/creating-helpful-content: no dates that make a page look fresher than it is`,
  "snippet": `${G}/appearance/ai-features: a page needs a snippet to be cited in AI Overviews / AI Mode`,
  "robots": "Googlebot, Bingbot and the answer-engine crawlers (OpenAI, Perplexity, Anthropic docs) must be allowed to fetch",
  "llms": "llmstxt.org. Google says it does not read it; kept in step because it is cheap",
  "image": `${G}/appearance/google-images: descriptive alt text`,
  "text": `${G}/appearance/ai-features: important content in text, in the HTML that is served`,
  "exchange": `${G}/essentials/spam-policies#link-spam: no link exchanges. House rule: never link back to a site we asked for a link`,
  "stale": "House rule: a 'checked' date is a promise; re-check the source or the date is a lie",
};

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export const bareUrl = (url) => url.replace(/[?#].*$/, "").replace(/\/$/, "");

/** Does robots.txt let `bot` fetch "/"? The most specific group wins; Allow beats Disallow on a tie. */
export function botAllowed(robotsTxt, bot) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [key, value] = [m[1].toLowerCase(), m[2].trim()];
    if (key === "user-agent") {
      if (!lastWasAgent) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (current && (key === "allow" || key === "disallow")) current.rules.push({ key, value });
    }
  }
  const group =
    groups.find((g) => g.agents.includes(bot.toLowerCase())) ?? groups.find((g) => g.agents.includes("*"));
  if (!group) return true;
  const hits = group.rules.filter((r) => r.value === "/" || r.value === "/*");
  if (!hits.length) return true;
  return hits.some((r) => r.key === "allow");
}

/**
 * @param {object} input
 * @param {ReturnType<import("./page.mjs").parsePage>[]} input.pages
 * @param {Set<string>} input.files     every non-HTML file path in dist ("/llms.txt")
 * @param {string[]} input.sitemapUrls
 * @param {string} input.robotsTxt
 * @param {string} input.llmsTxt
 * @param {{domain: string}[]} input.linkTargets   sites we asked for a link (never link back)
 * @param {{domain: string}[]} input.allowOutbound exceptions, each with a reason in the ledger
 * @param {{site: string, host: string, answerBots: string[], trainingBots: string[], llmsExempt: string[], servedByWorker?: string[]}} input.config
 * @param {string} input.today  YYYY-MM-DD
 */
export function runRules(input) {
  const { pages, files, sitemapUrls, robotsTxt, llmsTxt, linkTargets, allowOutbound, config, today } = input;
  const findings = [];
  const add = (level, rule, path, message) => findings.push({ level, rule, path, message });
  const urlOf = (path) => (path === "/" ? config.site : config.site + path);
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const indexable = pages.filter((p) => !p.noindex);
  const worker = new Set(config.servedByWorker ?? []);

  // --- per page ---
  const seenTitle = new Map();
  const seenDescription = new Map();
  const inbound = new Map(pages.map((p) => [p.path, 0]));
  const blocked = new Set(linkTargets.map((t) => t.domain));
  const allowed = new Set(allowOutbound.map((t) => t.domain));

  for (const page of pages) {
    for (const link of page.links) {
      const href = link.href;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
      let target;
      try {
        target = new URL(href, urlOf(page.path) + (page.path === "/" ? "/" : ""));
      } catch {
        add("error", "link", page.path, `unparseable href "${href}"`);
        continue;
      }
      const host = target.hostname.replace(/^www\./, "");
      if (host !== config.host) {
        const hit = [...blocked].find((d) => (host === d || host.endsWith(`.${d}`)) && !allowed.has(d));
        if (hit) add("error", "exchange", page.path, `links out to ${hit}, a site in the link ledger. We never link back.`);
        continue;
      }
      const path = target.pathname === "/" ? "/" : target.pathname.replace(/\/$/, "");
      if (target.pathname !== "/" && target.pathname.endsWith("/")) {
        add("warn", "link", page.path, `"${href}" ends in a slash and costs a redirect; link to ${path}`);
      }
      const dest = byPath.get(path);
      if (!dest && !files.has(path) && !worker.has(path)) {
        add("error", "link", page.path, `broken internal link "${href}"`);
        continue;
      }
      if (dest && dest !== page && !page.noindex) inbound.set(path, inbound.get(path) + 1);
      if (dest && target.hash.length > 1 && !dest.ids.has(decodeURIComponent(target.hash.slice(1)))) {
        add("warn", "link", page.path, `"${href}" points at an id that is not on ${path}`);
      }
    }
    for (const error of page.jsonldErrors) add("error", "jsonld", page.path, `JSON-LD does not parse: ${error}`);
    if (!page.lang) add("warn", "text", page.path, "<html> has no lang attribute");
  }

  for (const page of indexable) {
    const { path } = page;
    if (!page.title) add("error", "title", path, "no <title>");
    else {
      if (seenTitle.has(page.title)) add("error", "title", path, `same title as ${seenTitle.get(page.title)}: "${page.title}"`);
      else seenTitle.set(page.title, path);
      if (page.title.length > 65) add("warn", "title", path, `title is ${page.title.length} characters; Google usually cuts near 60`);
    }
    if (!page.description) add("error", "description", path, "no meta description");
    else {
      if (seenDescription.has(page.description)) add("error", "description", path, `same description as ${seenDescription.get(page.description)}`);
      else seenDescription.set(page.description, path);
      const n = page.description.length;
      if (n < 50 || n > 165) add("warn", "description", path, `description is ${n} characters (aim for 50 to 165)`);
    }
    if (!page.canonical) add("error", "canonical", path, "no canonical link");
    else if (bareUrl(page.canonical) !== bareUrl(urlOf(path))) add("error", "canonical", path, `canonical is ${page.canonical}, expected ${urlOf(path)}`);

    if (page.h1.length === 0) add("warn", "h1", path, "no h1");
    if (page.h1.length > 1) add("warn", "h1", path, `${page.h1.length} h1 elements`);

    if (/\bnosnippet\b|max-snippet:\s*0\b/.test(page.robots)) add("error", "snippet", path, "robots meta blocks snippets, which also blocks AI citations");
    for (const image of page.images) if (image.alt === null) add("warn", "image", path, `image without an alt attribute: ${image.src.slice(0, 80)}`);
    if (page.text.split(" ").length < 120) add("warn", "text", path, `only ${page.text.split(" ").length} words of text in the served HTML`);
    if (path !== "/" && inbound.get(path) === 0) add("error", "orphan", path, "no other page links here");

    const visible = norm(page.text);
    for (const node of jsonldNodes(page)) {
      for (const field of ["datePublished", "dateModified"]) {
        const value = typeof node[field] === "string" ? node[field].slice(0, 10) : null;
        if (value && value > today) add("error", "date", path, `${field} ${value} is in the future`);
      }
      if (node["@type"] === "Question") {
        if (!visible.includes(norm(node.name))) add("error", "jsonld", path, `FAQ question is in the markup but not on the page: "${node.name}"`);
        const answer = node.acceptedAnswer?.text;
        if (answer && !visible.includes(norm(answer))) add("error", "jsonld", path, `FAQ answer in the markup differs from the page: "${String(answer).slice(0, 70)}…"`);
      }
    }
  }

  // --- site wide ---
  const inSitemap = new Set(sitemapUrls.map(bareUrl));
  for (const page of indexable) if (!inSitemap.has(bareUrl(urlOf(page.path)))) add("error", "sitemap", page.path, "indexable page is not in the sitemap");
  for (const url of inSitemap) {
    const path = url === config.site ? "/" : url.slice(config.site.length);
    const page = byPath.get(path);
    if (!page) add("error", "sitemap", path, "sitemap lists a URL that was not built");
    else if (page.noindex) add("error", "sitemap", path, "sitemap lists a noindex page");
  }

  for (const bot of config.answerBots) if (!botAllowed(robotsTxt, bot)) add("error", "robots", "/robots.txt", `${bot} is blocked`);
  for (const bot of config.trainingBots) if (!botAllowed(robotsTxt, bot)) add("warn", "robots", "/robots.txt", `${bot} (training crawler) is blocked`);
  if (!/^sitemap:\s*https?:\/\//im.test(robotsTxt)) add("warn", "robots", "/robots.txt", "no Sitemap line");

  for (const page of indexable) {
    if (config.llmsExempt.includes(page.path)) continue;
    const url = urlOf(page.path);
    const listed = new RegExp(`${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/)?[)\\s]`).test(llmsTxt + "\n");
    if (!listed) add("warn", "llms", page.path, "not listed in llms.txt");
  }

  return findings;
}

/** "checked: 2026-07-01" in content frontmatter that has gone stale. */
export function staleDates(entries, maxAgeDays, today) {
  const findings = [];
  for (const { path, field, date } of entries) {
    const age = Math.floor((Date.parse(today) - Date.parse(date)) / 86_400_000);
    if (age > maxAgeDays) {
      findings.push({ level: "warn", rule: "stale", path, message: `${field} ${date} is ${age} days old (limit ${maxAgeDays}); re-check the source, then update the date` });
    }
  }
  return findings;
}
