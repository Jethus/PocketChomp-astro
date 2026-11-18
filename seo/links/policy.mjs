/**
 * The link-earning rules, as code. A link is only worth having if the other
 * site chose to give it: nothing is traded, paid for, or linked back.
 * Google's link-spam policy bans the same things (buying links, "link to me
 * and I'll link to you", links in widgets and templates), so breaking these
 * rules would also put the site's ranking at risk.
 */
import { existsSync, readFileSync } from "node:fs";

export const LEDGER_PATH = "seo/links/prospects.json";

/** found → qualified → pitched → live. "declined" = they said no; "dropped" = we walked away (see `dropReason`). */
export const STATUSES = ["found", "qualified", "pitched", "live", "declined", "dropped"];

/** What kind of page would carry the link. */
export const TYPES = ["directory", "resource-page", "listicle", "data-citation", "community", "newsletter", "podcast"];

/** Wording on a prospect's page that means a link there has a price. */
const PRICE_SIGNS = [
  [/link exchange|reciprocal link|exchange links|link swap|link back to (us|our)|add our (link|badge)/i, "asks for a link in return"],
  [/sponsored post|paid (post|placement|listing|review)|guest post(ing)? (fee|price|rate)|advertis(e|ing) (rates|with us)|submission fee|pay to (be )?(list|feature)|featured listing \$|\$\d+ ?(\/|per) ?(post|link|listing)/i, "sells placements"],
  [/write for us|submit a guest post|guest post guidelines/i, "takes guest posts (a link placed by the author, not earned)"],
];

/** Reasons a page should not be pitched, from its visible text. Empty means none found. */
export function priceSigns(text) {
  return PRICE_SIGNS.filter(([re]) => re.test(text)).map(([, reason]) => reason);
}

/** Problems with the ledger itself. An empty list means it obeys the rules. */
export function ledgerProblems(ledger) {
  const problems = [];
  const seen = new Set();
  for (const p of ledger.prospects) {
    const where = p.domain ?? "(no domain)";
    if (!p.domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(p.domain)) problems.push(`${where}: domain must be a bare lowercase host`);
    if (seen.has(p.domain)) problems.push(`${where}: listed twice`);
    seen.add(p.domain);
    if (!STATUSES.includes(p.status)) problems.push(`${where}: unknown status "${p.status}"`);
    if (!TYPES.includes(p.type)) problems.push(`${where}: unknown type "${p.type}"`);
    if (!p.page?.startsWith("https://")) problems.push(`${where}: page must be an https URL`);
    if (!p.target?.startsWith("/")) problems.push(`${where}: target must be the path on our site the link should point at`);
    if (!p.why) problems.push(`${where}: say why this site would want to list us`);
    if (p.asksForReturn && !["dropped", "declined"].includes(p.status)) {
      problems.push(`${where}: asked for something in return, so it must be dropped`);
    }
    if (p.status === "dropped" && !p.dropReason) problems.push(`${where}: dropped without a reason`);
  }
  for (const a of ledger.allowOutbound) {
    if (!a.domain || !a.reason) problems.push(`allowOutbound entry needs a domain and a reason`);
  }
  return problems;
}

export function readLedger(path = LEDGER_PATH) {
  if (!existsSync(path)) return { allowOutbound: [], prospects: [] };
  const ledger = JSON.parse(readFileSync(path, "utf8"));
  return { allowOutbound: ledger.allowOutbound ?? [], prospects: ledger.prospects ?? [] };
}
