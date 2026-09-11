import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://pocketchomp.com",
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
  integrations: [mdx(), sitemap()],
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
