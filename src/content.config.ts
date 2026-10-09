import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  // Type-check frontmatter using a schema
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
      /** Optional FAQ block; rendered after the body and emitted as FAQPage JSON-LD. */
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      /** Set `draft: true` to unpublish: no page, no listing, no sitemap entry. */
      draft: z.boolean().default(false),
    }),
});

const landingHero = defineCollection({
  loader: glob({ pattern: "hero.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    // Rotating accent line. Last entry is the punchline — it renders
    // statically (no-JS, reduced-motion, crawlers) and holds longest.
    accents: z
      .array(
        z.object({
          text: z.string(),
          tint: z.enum(["protein", "carb", "fat", "water", "calories", "sage", "ember"]),
        })
      )
      .min(2),
    description: z.string(),
    primaryCtaText: z.string(),
    primaryCtaLink: z.string(),
    secondaryCtaText: z.string(),
    secondaryCtaLink: z.string(),
    ctaNote: z.string(),
    collageCards: z.array(
      z.object({
        title: z.string(),
        body: z.string().optional(),
        kind: z.enum(["blank", "ring", "database", "bar"]),
      })
    ).length(4),
  }),
});

const landingProofStrip = defineCollection({
  loader: glob({ pattern: "proof-strip.md", base: "./src/content/landing" }),
  schema: z.object({
    items: z
      .array(
        z.object({
          value: z.string(),
          /** Optional supporting line. The strip reads as bare claims without it. */
          label: z.string().optional(),
        })
      )
      .min(3)
      .max(4),
  }),
});

const landingSocialProof = defineCollection({
  loader: glob({ pattern: "social-proof.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    testimonials: z.array(
      z.object({
        quote: z.string(),
        initials: z.string(),
        name: z.string(),
        role: z.string(),
        accent: z.enum(["green", "orange"]),
      })
    ).length(6),
  }),
});

const landingModularFeature = defineCollection({
  loader: glob({ pattern: "modular-feature.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    bullets: z.array(z.string()),
  }),
});

const landingValuePillars = defineCollection({
  loader: glob({ pattern: "value-pillars.md", base: "./src/content/landing" }),
  schema: () =>
    z.object({
      headline: z.string(),
      items: z
        .array(
          z.object({
            headline: z.string(),
            description: z.string(),
            icon: z.enum(["maple", "tag", "shield"]),
            /** Each pillar carries its own hue so the three read as a set. */
            tone: z.enum(["canadian", "free", "private"]),
          })
        )
        .length(3),
    }),
});

const landingBeyondCalorie = defineCollection({
  loader: glob({ pattern: "beyond-calorie.md", base: "./src/content/landing" }),
  schema: ({ image }) =>
    z.object({
      headline: z.string(),
      description: z.string(),
      panelLabel: z.string(),
      image: image(),
      imageAlt: z.string(),
    }),
});

const landingSignupCta = defineCollection({
  loader: glob({ pattern: "signup-cta.md", base: "./src/content/landing" }),
  schema: z.object({
    headline: z.string(),
    description: z.string(),
    inputPlaceholder: z.string(),
    buttonText: z.string(),
    note: z.string(),
  }),
});

const landingFreePremium = defineCollection({
  loader: glob({ pattern: "free-premium.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    /** How the app is paid for. Trust device in place of the user numbers a
        pre-launch site cannot cite honestly. */
    funding: z.string(),
    freeTitle: z.string(),
    freeNote: z.string(),
    premiumTitle: z.string(),
    premiumNote: z.string(),
    /**
     * Comparison matrix rows. Each cell is either a boolean (rendered as a
     * check or a dash) or a short string when the tiers differ by degree
     * rather than by presence — "2 at a time" vs "Unlimited" says more than
     * a cross would. Keep every paid row traceable to a real gate in the app
     * (see the verified gate list before adding one).
     */
    comparison: z.array(
      z.object({
        feature: z.string(),
        free: z.union([z.boolean(), z.string()]),
        plus: z.union([z.boolean(), z.string()]),
      })
    ),
  }),
});

const landingSupport = defineCollection({
  loader: glob({ pattern: "support.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    /** Lead paragraph. `{email}` is replaced with a mailto link at render. */
    intro: z.string(),
    email: z.string().email(),
    topics: z
      .array(z.object({ heading: z.string(), body: z.string() }))
      .min(1),
    stuckHeadline: z.string(),
    /** `{email}` is replaced with a mailto link at render. */
    stuckBody: z.string(),
  }),
});

const landingFaq = defineCollection({
  loader: glob({ pattern: "faq.md", base: "./src/content/landing" }),
  schema: z.object({
    headline: z.string(),
    items: z
      .array(
        z.object({
          q: z.string(),
          /** Plain text: it is rendered as-is and also emitted as FAQPage JSON-LD. */
          a: z.string(),
        })
      )
      .min(3),
  }),
});

const landingThanks = defineCollection({
  loader: glob({ pattern: "{thanks,confirmation}.md", base: "./src/content/landing" }),
  schema: z.object({
    headline: z.string(),
    description: z.string(),
    steps: z.array(z.string()).min(1).optional(),
    ctaText: z.string(),
    ctaLink: z.string(),
  }),
});

const landingFooter = defineCollection({
  loader: glob({ pattern: "footer.md", base: "./src/content/landing" }),
  schema: z.object({
    tagline: z.string(),
    /**
     * Grouped into labelled columns rather than one flat row. Past about six
     * entries a single wrapped list stops being scannable, and grouping also
     * signals site structure to crawlers.
     */
    groups: z
      .array(
        z.object({
          heading: z.string(),
          links: z
            .array(z.object({ label: z.string(), href: z.string() }))
            .min(1),
        })
      )
      .min(2),
  }),
});

const landingBlogMasthead = defineCollection({
  loader: glob({ pattern: "blog-masthead.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headlinePrefix: z.string(),
    headlineAccent: z.string(),
    lede: z.string(),
  }),
});

const landingBlogNow = defineCollection({
  loader: glob({ pattern: "blog-now.md", base: "./src/content/landing" }),
  schema: z.object({
    headline: z.string(),
    body: z.string(),
    items: z.array(z.string()),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    title: z.string(),
    metaDescription: z.string(),
    eyebrow: z.string(),
    h1: z.string(),
    intro: z.string(),
    mode: z.enum(["tdee", "deficit", "bmr", "macro"]),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .min(3),
    realityCheck: z
      .array(z.object({ condition: z.string(), adjustment: z.string() }))
      .min(3),
    ctaHeadline: z.string(),
    ctaNote: z.string(),
    related: z.object({ label: z.string(), href: z.string() }),
  }),
});

/**
 * Head-to-head comparison pages (/vs/<slug>).
 *
 * Claims are structured rather than prose so every row states what PocketChomp
 * does AND what the competitor does, side by side. Comparative advertising is
 * lawful when it is accurate and verifiable, so `note` exists to carry the
 * qualifier a claim needs — and `verified` records when the competitor's
 * details were last checked, because their pricing and features change.
 */
const comparisons = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/comparisons" }),
  schema: z.object({
    title: z.string(),
    metaDescription: z.string(),
    eyebrow: z.string(),
    h1: z.string(),
    intro: z.string(),
    competitor: z.string(),
    /** When the competitor's pricing/features were last checked. */
    verified: z.coerce.date(),
    verdict: z.object({
      headline: z.string(),
      body: z.string(),
      /** Who the competitor genuinely suits better. Keeps the page honest. */
      chooseThemIf: z.array(z.string()).min(1),
      chooseUsIf: z.array(z.string()).min(1),
    }),
    rows: z
      .array(
        z.object({
          feature: z.string(),
          ours: z.string(),
          theirs: z.string(),
          note: z.string().optional(),
        })
      )
      .min(4),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
    ctaHeadline: z.string(),
    ctaNote: z.string(),
  }),
});

const landingScreenRail = defineCollection({
  loader: glob({ pattern: "screen-rail.md", base: "./src/content/landing" }),
  schema: ({ image }) =>
    z.object({
      eyebrow: z.string(),
      headline: z.string(),
      description: z.string(),
      screens: z
        .array(
          z.object({
            title: z.string(),
            caption: z.string(),
            image: image(),
            alt: z.string(),
            tier: z.enum(["free", "plus"]).default("free"),
          })
        )
        .min(3),
    }),
});

export const collections = {
  tools,
  comparisons,
  blog,
  landingHero,
  landingProofStrip,
  landingSocialProof,
  landingModularFeature,
  landingValuePillars,
  landingBeyondCalorie,
  landingSignupCta,
  landingThanks,
  landingFreePremium,
  landingFaq,
  landingSupport,
  landingFooter,
  landingBlogMasthead,
  landingBlogNow,
  landingScreenRail,
};
