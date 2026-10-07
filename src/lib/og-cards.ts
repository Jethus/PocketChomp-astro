
/**
 * Card metadata shared by pages and the renderer. This module stays free of
 * satori/resvg imports so BaseLayout can use it without pulling the renderer
 * into every page.
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface OgCard {
  /** Small sage label above the title: "Blog", "Free calculator", "Comparison". */
  eyebrow: string;
  title: string;
  subtitle?: string;
}

/** Public path of a page's card, as emitted by src/pages/og/[...slug].png.ts. */
export function ogPath(slug: string) {
  return `/og/${slug}.png`;
}

/**
 * Cards for the hand-written pages. Collection-backed pages (blog, tools, vs)
 * derive theirs from frontmatter in src/pages/og/[...slug].png.ts. Keys are
 * the card's path under /og/; BaseLayout uses `default` when a page sets none.
 */
export const OG_CARDS: Record<string, OgCard> = {
  default: {
    eyebrow: "Free calorie counter & macro tracker",
    title: "Nutrition tracking, on your terms.",
    subtitle:
      "Built on Canadian shelves. Unlimited barcode scanning, every micronutrient, and a food log that stays on your phone. No ads, and the basics are never paywalled.",
  },
  plus: {
    eyebrow: "Free vs PocketChomp+",
    title: "What's free, and what's paid.",
    subtitle:
      "Barcode scanning, label scanning, micronutrients and offline logging are free forever. No ads on either tier.",
  },
  tools: {
    eyebrow: "Free calculators",
    title: "Calorie, macro and TDEE calculators.",
    subtitle: "Honest ranges, not fake precision. No account, nothing stored.",
  },
  blog: {
    eyebrow: "Building in public",
    title: "Field notes from a tiny app.",
    subtitle:
      "How PocketChomp gets built: the Canadian food database, local-first sync, the adaptive calorie math, and the decisions behind them.",
  },
  support: {
    eyebrow: "Support",
    title: "Get help with PocketChomp.",
    subtitle: "Contact the developer, manage your PocketChomp+ subscription, export or delete your data.",
  },
};
