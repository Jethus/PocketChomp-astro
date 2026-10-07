# PocketChomp website

Marketing site for [PocketChomp](https://pocketchomp.com), a calorie and macro tracker for Android with an offline food database built around Canadian foods.

**Live site:** https://pocketchomp.com

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
