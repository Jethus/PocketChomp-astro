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
    accent: z.string(),
    description: z.string(),
    primaryCtaText: z.string(),
    primaryCtaLink: z.string(),
    secondaryCtaText: z.string(),
    secondaryCtaLink: z.string(),
    collageCards: z.array(
      z.object({
        title: z.string(),
        body: z.string().optional(),
        kind: z.enum(["blank", "ring", "database", "bar"]),
      })
    ).length(4),
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
  schema: z.object({
    items: z.array(
      z.object({
        eyebrow: z.string(),
        headline: z.string(),
        description: z.string(),
        icon: z.enum(["shield", "ban", "cloud", "maple"]),
        tone: z.enum(["default", "canadian"]).default("default"),
        chips: z.array(z.string()),
      })
    ).length(4),
  }),
});

const landingBeyondCalorie = defineCollection({
  loader: glob({ pattern: "beyond-calorie.md", base: "./src/content/landing" }),
  schema: z.object({
    headline: z.string(),
    description: z.string(),
    nutrients: z.array(z.string()).length(4),
    statLabel: z.string(),
    progressBars: z.array(
      z.object({
        label: z.string(),
        percentage: z.number().int().min(0).max(100),
        fill: z.enum(["primary", "accent"]),
      })
    ).length(2),
    statMetricLabel: z.string(),
    statValue: z.string(),
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

const landingFooter = defineCollection({
  loader: glob({ pattern: "footer.md", base: "./src/content/landing" }),
  schema: z.object({
    tagline: z.string(),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    ).length(3),
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

export const collections = {
  blog,
  services,
  portfolio,
  landingHero,
  landingSocialProof,
  landingModularFeature,
  landingValuePillars,
  landingBeyondCalorie,
  landingSignupCta,
  landingFooter,
  landingBlogMasthead,
  landingBlogNow,
};
