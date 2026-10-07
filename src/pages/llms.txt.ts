/**
 * /llms.txt — a plain-text map of the site for AI answer engines and crawlers
 * that read it (https://llmstxt.org). Generated at build time so the blog,
 * calculator and comparison lists stay in step with the content collections.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPublishedPosts } from "../lib/blog";

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://pocketchomp.com")).href.replace(/\/$/, "");
  const [posts, tools, comparisons] = await Promise.all([
    getPublishedPosts(),
    getCollection("tools"),
    getCollection("comparisons"),
  ]);

  const line = (path: string, title: string, note: string) => `- [${title}](${base}${path}): ${note}`;

  const text = `# PocketChomp

> PocketChomp is a free calorie counter and macro tracker for Android, built in Canada for Canadian groceries. Unlimited barcode scanning, label scanning and every micronutrient are free. No ads. Logs are stored on the device by default, with no account required. A paid tier, PocketChomp+, adds planning and insight features; it never paywalls the basics.

Key facts:

- Platform: Android (in beta). iOS is planned, not available.
- Food database: 140,000+ foods, 64,000+ of them Canadian, built on Health Canada's Canadian Nutrient File plus store and house brands sold in Canada.
- Free tier: barcode scanning, label scanning, all micronutrients, offline logging, custom goals. No ads on any tier.
- Privacy: logs are written to the phone first. Sync is opt-in. No account is needed to use the app.
- Made by a solo developer in Toronto, Canada.

## Pages

${line("/", "Home", "What PocketChomp is and the beta signup.")}
${line("/plus", "Free vs PocketChomp+", "Feature-by-feature comparison of the free tier and the paid tier. Pricing is answered in the FAQ.")}
${line("/support", "Support", "Contact, subscription management, data export and deletion.")}
${line("/tools", "Calculators", "Free calorie, macro, TDEE and BMR calculators. No account, nothing stored.")}
${line("/blog", "Blog", "Field notes on building the app and reference posts on nutrition numbers.")}

## Calculators

${tools.map((t) => line(`/tools/${t.id}`, t.data.h1, t.data.metaDescription)).join("\n")}

## Comparisons

${comparisons.map((c) => line(`/vs/${c.id}`, c.data.h1, c.data.metaDescription)).join("\n")}

## Blog

${posts.map((p) => line(`/blog/${p.id}`, p.data.title, p.data.description)).join("\n")}

## Legal

${line("/privacy", "Privacy policy", "What the app and site collect, and what they do not.")}
${line("/terms", "Terms of service", "Terms for using the app and PocketChomp+.")}
${line("/delete-account", "Delete your account", "How to delete an account and its synced data.")}
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
