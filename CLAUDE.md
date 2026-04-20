# CLAUDE.md

This file is the agent workflow harness for `C:\repos\PocketChomp-astro`.
`AGENTS.md` should point to this file so there is one source of truth.

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

Landing page sections are modeled as singleton collections in `src/content/landing/`:

- `landingHero` -> `hero.md`
- `landingWhatWeOffer` -> `what-we-offer.md`
- `landingPortfolio` -> `portfolio.md`
- `landingComparison` -> `comparison.md`
- `landingPricing` -> `pricing.md`
- `landingCTA` -> `cta.md`

Repeatable content collections live separately:

- `src/content/services/`
- `src/content/portfolio/`
- `src/content/blog/`

If a new landing section is added, prefer creating a new collection entry and schema rather than hardcoding editable copy in a component.

### Render Flow

The homepage at `src/pages/index.astro` is intentionally thin. It composes section components only:

- `Hero`
- `Features`
- `Portfolio`
- `Comparison`
- `Pricing`
- `ClosingCTA`

Each section component fetches its own content with `getEntry()` or `getCollection()`. Keep that pattern unless there is a strong architectural reason to centralize data loading.

### Route Patterns

- `src/pages/services/[slug].astro` provides dynamic detail pages for services.
- `src/pages/blog/[slug].astro` and `src/pages/blog/index.astro` exist for blog content.
- Portfolio content is currently used as collection-driven marketing content, not a detail-page system.

### Non-Obvious Implementation Details

- `src/components/Features.astro` contains a hardcoded `iconMap` keyed by service slug. Add or update entries when adding service content that needs a custom icon.
- Service cards are sorted using each service entry's `order` field.
- The site is already wired to `src/content/blog/` in `src/content.config.ts`; do not reintroduce the old broken `src/data/blog/` path.

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

Astro's local font provider is configured for:

- `Lato` for headings
- `Noto Sans` for body copy

Keep these decisions aligned across layout, tokens, and component styling unless the brand direction is intentionally being changed.

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

- use the repo's existing font system unless branding is explicitly changed
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
