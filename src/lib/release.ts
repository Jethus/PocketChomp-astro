/**
 * Dated releases. A blog post (pubDate) or restaurant page (publishOn) dated
 * ahead is left out of the build until the first build on or after that day,
 * Toronto time. The daily SEO job (seo/README.md) rebuilds every morning, so
 * finished pages can be queued and go live one at a time.
 */
export function torontoDay(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

/** Frontmatter dates are bare (2026-11-20) and parse as UTC midnight, so compare calendar days. */
export function isLive(date: Date | undefined, now: Date = new Date()): boolean {
  return !date || date.toISOString().slice(0, 10) <= torontoDay(now);
}
