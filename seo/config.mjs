/**
 * Settings for the SEO engine (seo/README.md). Everything here is public:
 * the IndexNow key is served from the site root by design.
 */
export const SITE = "https://pocketchomp.com";
export const HOST = "pocketchomp.com";
export const DIST = "dist";
export const MANIFEST = "seo-manifest.json";

/** Where the weekly SEO report is emailed (already public on the support page). */
export const REPORT_TO = "josh@pocketchomp.com";

/** Proves to IndexNow that we own the host; also served as public/<key>.txt. */
export const INDEXNOW_KEY = "d3eb4243c2830a4142b1a775c348b8a4";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Crawlers that decide whether a page can be shown or cited in an answer.
 * robots.txt blocking any of them is an audit error.
 */
export const ANSWER_BOTS = [
  "Googlebot",
  "bingbot",
  "OAI-SearchBot",
  "PerplexityBot",
  "Claude-SearchBot",
  "Applebot",
  "DuckDuckBot",
];

/** Training crawlers. Allowed on purpose (2026-10-07); blocking one is a warning, not an error. */
export const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"];

/** Pages llms.txt does not need to list. */
export const LLMS_EXEMPT = ["/404"];

/** A "checked"/"verified" date older than this gets a re-check warning. */
export const STALE_AFTER_DAYS = { restaurants: 120, comparisons: 90 };

/** Today in Toronto (YYYY-MM-DD), the calendar the release dates use. */
export const torontoToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

/** Referrers counted as search engines and as AI assistants in the report. */
export const SEARCH_SOURCES = /^(google|bing|duckduckgo|brave|ecosia|yahoo|kagi|startpage|qwant|yandex)\b/i;
export const AI_SOURCES = /chatgpt|openai|perplexity|copilot|gemini|claude\.ai|you\.com|phind|meta\.ai|mistral/i;
