# Kit email templates

Paste a template into Kit: Send → Email Templates → New → HTML. Each one carries Kit's three requirements: `{{ message_content }}`, `{{ unsubscribe_url }}` and `{{ address }}`.

- `letter.html`: personal notes from Josh (beta, feedback asks). Wordmark on plain white, no card, so it reads like an email from a person.
- `announcement.html`: launches and updates. Dark ember slab with the white wordmark.
- `snippets/`: inline-styled blocks for a broadcast's HTML block. `facts-panel.html` is the "Beta Facts" label; `stat-slab.html` is one big number on the dark slab.

Images load from `https://pocketchomp.com/email/` (`public/email/`, built by `node scripts/build-email-assets.mjs`), so they only work once the site is deployed.
