# AGENTS.md

Start here for this repository. Keep this file short, and use it as the entry point into the fuller project instructions in [CLAUDE.md](/C:/repos/PocketChomp-site/CLAUDE.md).

## Project

PocketChomp is a content-first Astro marketing site built with Astro 6 and Tailwind CSS v4. Preserve PocketChomp-specific positioning and remove leftover agency-template assumptions when editing copy, layout, or structure.

## First Reads

Read these before making material changes:

1. [CLAUDE.md](/C:/repos/PocketChomp-site/CLAUDE.md)
2. [.agents/rules/00-context.md](/C:/repos/PocketChomp-site/.agents/rules/00-context.md)
3. [.agents/rules/01-architecture.md](/C:/repos/PocketChomp-site/.agents/rules/01-architecture.md)

Use these as needed:

- [.agents/workflows/ui-gen.md](/C:/repos/PocketChomp-site/.agents/workflows/ui-gen.md) for UI generation
- `.agents/skills/tailwind-4-docs/` for Tailwind v4 doc lookups and gotchas

## Non-Negotiables

- Check Astro docs before generating or refactoring Astro-specific logic.
- Check the local Tailwind v4 docs/gotchas before generating new UI.
- Keep the site compatible with Astro static output unless the user explicitly changes that constraint.
- Keep editable marketing copy in Markdown collections with matching Zod schemas in `src/content.config.ts`.
- Prefer `.md` over `.mdx` unless embedded interactive components are explicitly needed inside content.
- Preserve the existing content-collection architecture instead of hardcoding large editable copy blocks in components.

## Design Direction

- Keep styling aligned with `src/styles/global.css` and the repo token system.
- Preserve the OKLCH token approach and Tailwind v4 CSS-variable workflow.
- Brand typography is `Geist` for body copy and `Montserrat Black` for titles/headings.
- Treat the current codebase font setup as implementation detail that may lag behind the intended brand direction; do not introduce new conflicting font choices.

## Working Style

- Make small, architecture-consistent changes.
- Update content schema, Markdown content, and consuming components together when a section changes.
- Treat `design/` as reference material only, not production code to copy directly.
