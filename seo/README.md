# The SEO engine

Four loops. Each one is a script that reads public pages or our own numbers; none of them writes content or contacts anyone.

| Loop | What it does | Runs |
|---|---|---|
| Gate | `seo/audit.mjs` checks every built page against Google's published rules and fails the build on an error | every `npm run build`, so every deploy |
| Release | A page dated ahead (`pubDate` on a post, `publishOn` on a restaurant page) is built on the first morning on or after that day | daily |
| Notify | `seo/indexnow.mjs` tells IndexNow (Bing, and the answer engines that search through it) which URLs changed | daily |
| Learn | `seo/measure.mjs` reports visitors from search and from AI assistants, new referring sites, and searches we almost rank for; `seo/links/check.mjs` reports who links to us | to-do emailed Mondays; link check on your machine |

The daily run is `.github/workflows/seo-daily.yml`. When the morning's build differs from the live site it pushes an empty commit ("Daily release: /restaurants/x goes live") so Workers Builds deploys it. Its state (the IndexNow record, public URLs only) lives on the `seo-state` branch, which nothing deploys from. This repo is public and so is everything an Actions run writes, so the traffic report is never printed or saved there. On Mondays the job emails only the to-do (`seo/email-report.mjs`, through Fastmail SMTP): searches the site almost ranks for, and sites that sent visitors for the first time. A week with neither sends nothing. Run `npm run seo:measure` for the full report any day.

## Queue a page

Finish the page, then date it:

- Blog post: set `pubDate` to the day it should appear.
- Restaurant page: add `publishOn: 2026-12-01` to its frontmatter.

Merge it whenever. It stays out of the build, the sitemap, `llms.txt` and the hubs until that day. `npm run seo:audit` lists what is scheduled.

There is no page generator, on purpose. Google's spam policy calls pages mass-produced to rank "scaled content abuse", and treats near-identical pages aimed at similar searches as doorways. Every page here is written and checked by a person, and the engine only decides when it appears. A restaurant page still needs its numbers compared against the chain's own site before it is dated.

## The audit rules

Each rule prints the guidance it enforces. Errors stop the build:

- a missing or duplicated title or description, a wrong canonical
- a broken internal link, or a page nothing links to
- a page missing from the sitemap, or a `noindex` page in it
- JSON-LD that does not parse, or FAQ markup that differs from the visible page
- a published or modified date in the future
- a robots meta that blocks snippets (it also blocks AI Overviews and AI Mode citations)
- `robots.txt` blocking Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot or DuckDuckBot
- a link from our site to any site in the link ledger

Warnings are judgement calls: long titles, thin text in the served HTML, missing alt text, pages missing from `llms.txt`, and a `checked` or `verified` date that has gone stale (120 days for restaurants, 90 for comparisons). A stale date means re-check the source, then change the date; never the date alone.

What the audit does not check, because Google says it does not count: keyword density, word count, heading order, meta keywords.

## Showing up in AI answers

Google's own guidance is that AI Overviews and AI Mode need nothing beyond being indexed with a snippet: no special file, no special markup. ChatGPT search needs OAI-SearchBot allowed, and it leans on Bing's index, which is why IndexNow is here. What is left is what the audit already enforces (crawlable, in text, markup that matches the page) plus being mentioned on other sites, which is the link ledger's job. `llms.txt` is kept in step because it costs nothing, not because anyone has shown it helps.

## Links

`seo/links/prospects.json` is the ledger of sites that might list us. It is git-ignored because this repo is public, so the link check and the outbound-link rule only run on a machine that has it; without it they find nothing to check. `seo/links/policy.mjs` is the rules as code:

1. Nothing is traded. A site that asks for a link, a badge or a fee in return is marked `dropped`, with the reason.
2. We never link back. The build fails if any page links to a ledger site. The one exception is listed in `allowOutbound` with its reason (Open Food Facts, whose data licence requires the credit).
3. No guest posts, widgets, footer links or automated submissions. Google names each of these as link spam.
4. Every pitch is one person writing to another about a page that already lists apps like this one, and says plainly that the sender makes the app.

Statuses: `found` (not yet read closely), `qualified` (read; free, no strings), `pitched`, `live`, `declined`, `dropped`. `npm run seo:links` visits each open prospect and reports new links, lost links and pages that show a price. It never edits the ledger.

Prospects worth adding are pages that already list apps like this one for readers: buy-Canadian software directories, "apps I use" pages by dietitians and coaches, tested roundups on small blogs, and anyone citing the restaurant tables or the price comparison. Not worth adding: anything that sells placement, link-exchange "partner" pages, and outlets too large to answer.

## Commands

```
npm run build          build, then audit (fails on an error)
npm run seo:audit      audit the last build, report only
npm run seo:links      check the ledger
npm run seo:measure    write the report (needs PLAUSIBLE_CE in .env)
npm run seo:dfs        weekly DataForSEO rank, backlink & AI Overview check (needs DATAFORSEO_LOGIN/PASSWORD; add -- --ai for LLM Mentions)
npm run seo:email      email the last to-do (needs the Fastmail SMTP pair in .env)
npm run seo:indexnow -- --dry-run
npm test
```

## Setup, once

1. Merge to `main`. The audit and dated releases work from then on, and the IndexNow key file (`public/<key>.txt`) goes live.
2. `.env` and GitHub repo secrets: `PLAUSIBLE_CE` (a Stats API key from the self-hosted Plausible), and `FASTMAIL_SMTP_USER` / `FASTMAIL_SMTP_PASSWORD` (the Fastmail login and an app password limited to SMTP, so it can send but not read mail).
3. Search Console, optional but it is the main signal: create a Google Cloud service account, add its email as a user on the Search Console property, and save its JSON key as the secret `GSC_SERVICE_ACCOUNT`. If the property is a URL prefix rather than a domain, set the repo variable `GSC_SITE` to `https://pocketchomp.com/`. This path has not been run yet; the first run is its test.
4. Bing Webmaster Tools: the site is already verified (`BingSiteAuth.xml`). Its AI Performance report shows which pages Copilot cites; there is no API for it here, so read it by hand.
