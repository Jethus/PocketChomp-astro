// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://pixelboost.ca",
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
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  security: { csp: true },
  experimental: {
    rustCompiler: true,
    queuedRendering: { enabled: true },
  },
});
