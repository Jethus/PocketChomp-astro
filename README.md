# PocketChomp website

Marketing site for [PocketChomp](https://pocketchomp.com), a calorie counter built on Canadian shelves.

**Live site:** https://pocketchomp.com

## What PocketChomp is

Nutrition tracking on your terms. Unlimited barcode scanning, every micronutrient, and a food log that stays on your phone unless you decide otherwise. No ads, and the basics are never paywalled.

- **Your groceries are actually in it.** Health Canada's nutrient file plus the house brands you actually buy. 130,000+ foods, 60,000+ of them Canadian. Metric, and it's fibre, not fiber.
- **The basics are never paywalled.** Barcode scanning, label scanning and every micronutrient are free. Plus adds intelligence, never the basics back.
- **On your device by default.** Every log is written to your phone first. No account needed, and sync is something you turn on.
- **Beyond the calorie.** Vitamins, minerals, fibre, caffeine, omega-3, each measured against your own daily target.

Android, in beta. Built by one person in Ontario.

## About this repo

Built with [Astro](https://astro.build) and Tailwind CSS v4, served as static assets from a Cloudflare Worker. Page copy lives in Markdown content collections under `src/content/`, so the landing sections, blog posts and calculator pages are edited as content rather than code.

## Commands

| Command           | Action                                   |
| :---------------- | :--------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Start the dev server at `localhost:4321` |
| `npm run build`   | Build the production site to `./dist/`  |
| `npm run preview` | Preview the build locally                |
| `npx wrangler deploy` | Build output to Cloudflare Workers   |

## Layout

- `src/content/landing/` - one Markdown file per homepage section
- `src/content/blog/` - blog posts
- `src/content/tools/` - calculator pages
- `src/components/` - section and UI components
- `src/styles/global.css` - design tokens and fluid type scale
- `worker/index.js` - the Cloudflare Worker that serves `dist/`

## Related

- [pixelboost.ca](https://pixelboost.ca) - the studio behind PocketChomp
