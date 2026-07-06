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
    }),
});

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: () =>
    z.object({
      tab: z.string(),
      label: z.string(),
      order: z.number(),
    }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tags: z.string(),
      image: image(),
      outcome: z.string().optional(),
    }),
});

const landingHero = defineCollection({
  loader: glob({ pattern: "hero.md", base: "./src/content/landing" }),
  schema: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    // Rotating accent line. Last entry is the punchline — it renders
    // statically (no-JS, reduced-motion, crawlers) and holds longest.
    accents: z.array(z.string()).min(2),
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
          label: z.string(),
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
            eyebrow: z.string(),
            headline: z.string(),
            description: z.string(),
            icon: z.enum(["shield", "ban", "cloud", "maple"]),
            tone: z.enum(["default", "canadian"]).default("default"),
            chips: z.array(z.string()),
          })
        )
        .length(4),
    }),
});

const landingBeyondCalorie = defineCollection({
  loader: glob({ pattern: "beyond-calorie.md", base: "./src/content/landing" }),
  schema: ({ image }) =>
    z.object({
      headline: z.string(),
      description: z.string(),
      nutrients: z.array(z.string()).length(4),
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
    freeTitle: z.string(),
    freeNote: z.string(),
    freeItems: z.array(z.string()),
    premiumTitle: z.string(),
    premiumNote: z.string(),
    premiumItems: z.array(z.string()),
  }),
});

const landingFooter = defineCollection({
  loader: glob({ pattern: "footer.md", base: "./src/content/landing" }),
  schema: z.object({
    tagline: z.string(),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    ).min(1),
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
    mode: z.enum(["tdee", "deficit"]),
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

export const collections = {
  tools,
  blog,
  services,
  portfolio,
  landingHero,
  landingProofStrip,
  landingSocialProof,
  landingModularFeature,
  landingValuePillars,
  landingBeyondCalorie,
  landingSignupCta,
  landingFreePremium,
  landingFooter,
  landingBlogMasthead,
  landingBlogNow,
};
