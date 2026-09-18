# CLAUDE.md

This file is the agent workflow harness for `C:\repos\PocketChomp-site`.
`AGENTS.md` is the short entry point for this file and the `.agents` rules.

## Purpose

This repository is the **PocketChomp marketing site**, built with **Astro 6**, **Tailwind CSS v4**, and a **content-first Markdown architecture**.

The site was derived from the main agency Astro site, so agents should actively preserve PocketChomp-specific positioning and remove agency assumptions when editing copy, layout, or content structure.

## Commands

- `npm run dev` - Start the Astro dev server
- `npm run build` - Build the static site into `dist/`
- `npm run preview` - Preview the production build locally
- No test runner or linter is configured in this repo

## Agent Workflow

- Read this file before making changes.
- Treat this file as the canonical agent instructions file for the repo.
- Keep content authored in Markdown collections whenever the page copy is user-managed content.
- Prefer editing schemas, content files, and section components together so the content model stays coherent.
- Preserve the existing Astro-first approach. Do not introduce React components unless there is a clear need.
- Preserve the design token system in `src/styles/global.css`; do not replace it with ad hoc colors, font stacks, or Tailwind defaults.
- Use the `design/` directory as reference material, not as a source of production code to copy verbatim.
- When translating ideas from the mockup into the site, adapt them to the existing content-collection architecture instead of hardcoding large blocks of copy in components.

## Architecture

This is a static Astro marketing site assembled from content collections and section components.

### Content Model

Content lives under `src/content/` and is defined in `src/content.config.ts`.

Landing page sections are modeled as singleton collections in `src/content/landing/`
(hero, proof strip, value pillars, modular feature, beyond-calorie, screen rail,
free/premium, FAQ, support, signup CTA, thanks, footer, blog masthead and blog "now"). Each has a
`landingX` collection in `src/content.config.ts` and one Markdown file.

Repeatable content collections live separately:

- `src/content/blog/`
- `src/content/tools/` (calculator pages)

Legal pages (`/privacy`, `/terms`, `/delete-account`) are plain `.astro` pages under
`src/pages/` that share `src/layouts/LegalLayout.astro`. The app links to all three
by URL, and Google Play requires the deletion page, so keep those routes stable.

If a new landing section is added, prefer creating a new collection entry and schema rather than hardcoding editable copy in a component.

### Render Flow

The homepage at `src/pages/index.astro` is intentionally thin. It composes section
components only (Hero, ProofStrip, ScreenRail, ModularFeature, ValuePillars,
BeyondCalorie, Faq, FieldNotesTeaser, ClosingCTA). `SocialProof` exists but is
deliberately unmounted until real testimonials exist.

Pricing is deliberately NOT on the homepage: the free-vs-Plus argument lives on `/plus`
and in the FAQ. `PlanStrip` is a built but unmounted compact version of that card pair
(same `src/content/landing/free-premium.md` source as the `/plus` matrix), kept for if
that decision is ever revisited. FAQ lists everywhere use
`src/components/ui/FaqList.astro` so the homepage, calculators and comparison pages
share one treatment.

Each section component fetches its own content with `getEntry()` or `getCollection()`. Keep that pattern unless there is a strong architectural reason to centralize data loading.

### Route Patterns

- `src/pages/tools/[slug].astro` renders the calculator pages from the `tools` collection;
  `src/pages/tools/index.astro` lists them and is the header's "Calculators" target.
- `/support` reads the `landingSupport` singleton; `{email}` in its copy becomes a mailto link.
- `src/pages/blog/[slug].astro` and `src/pages/blog/index.astro` exist for blog content.
- `/thanks` is the Kit signup redirect target and is `noindex`; `/404` is a static page.

### Non-Obvious Implementation Details

- Service cards from the agency site are gone; there is no `services` or `portfolio` collection anymore.
- The site is wired to `src/content/blog/` in `src/content.config.ts`; do not reintroduce the old broken `src/data/blog/` path.
- The site ships a strict CSP with no `unsafe-inline` for styles. Inline `style` attributes are silently dropped in production; put per-element values in scoped `<style>` rules.

## Design System

### Styling Stack

- Tailwind CSS v4 is configured through `@tailwindcss/vite`
- Global tokens and custom utilities live in `src/styles/global.css`
- Astro local fonts are configured in `astro.config.mjs`

### Color System

The color tokens use **OKLCH** in `@theme`. Preserve that approach.

Core tokens currently include:

- `--color-primary`
- `--color-primary-light`
- `--color-primary-dark`
- `--color-accent`
- `--color-ink`
- `--color-surface`

Do not replace these with hex-based one-off colors unless there is a very specific reason.

### Typography

The repo uses a custom fluid type system in `src/styles/global.css` built with `pow()` and `clamp()`.

- Body and headings inherit fluid sizing automatically
- Utility classes `fs-xs` through `fs-xxxl` are defined via `@utility`
- Headings are controlled through the `--fl` scale variable

Do not swap this for Tailwind Typography defaults or fixed pixel font sizing.

### Fonts

Brand typography for this project is:

- `Montserrat Black` for titles and headings
- `Geist` for body copy

If the implementation still references older fonts, treat that as lagging code rather than the desired design direction. Do not introduce any new conflicting font choices, and keep future typography work aligned with this brand decision across layout, tokens, and component styling.

## Astro Features In Use

`astro.config.mjs` currently enables:

- `security: { csp: true }`
- `experimental.rustCompiler`
- `experimental.queuedRendering`
- `@astrojs/mdx`
- `@astrojs/react`
- `@astrojs/sitemap`

Do not remove or bypass these features casually. If a change depends on them, verify it still works with the current Astro configuration.

## Design References

The `design/` folder contains reference material for future visual improvements:

- `design/Landing Page v2.html`
- `design/Main Design - Light.png`
- `design/Main Design - Dark.png`

These are exploratory mockups, not production templates. Agents should extract useful direction from them:

- stronger product marketing framing
- clearer hierarchy and section pacing
- more intentional visual contrast and product personality

But production implementation should still:

- use the project typography direction of `Montserrat Black` for headings and `Geist` for body copy
- stay within the OKLCH token system
- keep content editable through Markdown collections
- fit Astro component boundaries already used in the repo

## Content Rules

- Marketing copy should live in Markdown where practical.
- Structural UI primitives can stay in `.astro` components.
- If a section needs richer content, expand the collection schema instead of moving copy into component source.
- Avoid embedding long product copy directly in section components.
- Keep frontmatter schemas explicit and typed with Zod in `src/content.config.ts`.

## Editing Guidance

- Favor small, architecture-consistent changes over broad rewrites.
- If the agency-site inheritance conflicts with PocketChomp positioning, prefer PocketChomp-specific language and structure.
- When adding sections inspired by the mockup, update all three layers together:
  1. `src/content.config.ts`
  2. the relevant Markdown content file(s)
  3. the consuming Astro component/page
- If a design idea cannot be expressed cleanly within the current content model, evolve the content model instead of bypassing it.
