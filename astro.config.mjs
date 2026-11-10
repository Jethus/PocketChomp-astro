import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync, readFileSync } from "node:fs";

const SITE = "https://pocketchomp.com";

// <lastmod> for the pages that carry a real date: blog posts (updatedDate,
// else pubDate) and restaurant pages (checked), plus their hubs at the newest
// of those. Everything else gets none, since a build date would change on
// every deploy and teach Google to ignore the field.
function frontmatterDates(dir, fields) {
  const dates = new Map();
  for (const file of readdirSync(dir)) {
    if (file.startsWith("_") || !/\.mdx?$/.test(file)) continue;
    const text = readFileSync(`${dir}/${file}`, "utf8");
    if (/^draft:\s*true/m.test(text)) continue;
    for (const field of fields) {
      const m = text.match(new RegExp(`^${field}:\\s*"?(\\d{4}-\\d{2}-\\d{2})`, "m"));
      if (m) {
        dates.set(file.replace(/\.mdx?$/, ""), m[1]);
        break;
      }
    }
  }
  return dates;
}

function lastmodByUrl() {
  const byUrl = new Map();
  for (const [section, fields] of [["blog", ["updatedDate", "pubDate"]], ["restaurants", ["checked"]]]) {
    const dates = frontmatterDates(`./src/content/${section}`, fields);
    for (const [slug, date] of dates) byUrl.set(`${SITE}/${section}/${slug}`, date);
    const newest = [...dates.values()].sort().at(-1);
    if (newest) byUrl.set(`${SITE}/${section}`, newest);
  }
  return byUrl;
}
const lastmod = lastmodByUrl();

export default defineConfig({
  site: SITE,
  // Canonical URLs carry no trailing slash (/tools, not /tools/), matching the
  // internal links and JSON-LD. Cloudflare Assets (html_handling
  // "drop-trailing-slash" in wrangler.jsonc) 308s the slash form to the bare
  // path so Google consolidates on one URL.
  trailingSlash: "never",
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Montserrat",
      cssVariable: "--font-montserrat",
      options: {
        variants: [
          {
            weight: "100 900",
            style: "normal",
            src: ["./node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2"],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Geist",
      cssVariable: "--font-geist",
      options: {
        variants: [
          {
            weight: "100 900",
            style: "normal",
            src: ["./node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2"],
          },
        ],
      },
    },
  ],
  integrations: [
    mdx(),
    // /confirmation and /thanks are post-signup pages, disallowed in robots.txt; keep them out.
    sitemap({
      filter: (page) => !page.includes("/thanks") && !page.includes("/confirmation"),
      serialize(item) {
        const date = lastmod.get(item.url.replace(/\/$/, ""));
        if (date) item.lastmod = date;
        return item;
      },
    }),
  ],
  markdown: {
    syntaxHighlight: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  security: {
    csp: {
      // Astro hashes every bundled script; this only widens the host list so
      // the optional Cloudflare Web Analytics beacon and the self-hosted
      // Plausible script can load. There is no default-src, so connect-src is
      // unrestricted and Plausible's event POSTs need no extra allowance.
      scriptDirective: {
        resources: [
          "'self'",
          "https://static.cloudflareinsights.com",
          "https://data.pixelboost.dev",
        ],
      },
    },
  },
});
