/**
 * Build-time Open Graph cards: one PNG per page under /og/. Each page passes
 * its own card path to BaseLayout (image="/og/<slug>.png"); pages that pass
 * nothing fall back to /og/default.png.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { getPublishedPosts } from "../../lib/blog";
import { renderOgCard, type OgCard } from "../../lib/og";
import { OG_CARDS } from "../../lib/og-cards";

export const getStaticPaths: GetStaticPaths = async () => {
  const [posts, tools, comparisons] = await Promise.all([
    getPublishedPosts(),
    getCollection("tools"),
    getCollection("comparisons"),
  ]);

  const cards: Array<{ slug: string; card: OgCard }> = [
    ...Object.entries(OG_CARDS).map(([slug, card]) => ({ slug, card })),
    ...posts.map((p) => ({
      slug: `blog/${p.id}`,
      card: { eyebrow: "Blog", title: p.data.title, subtitle: p.data.description },
    })),
    ...tools.map((t) => ({
      slug: `tools/${t.id}`,
      card: { eyebrow: "Free calculator", title: t.data.h1, subtitle: t.data.intro },
    })),
    ...comparisons.map((c) => ({
      slug: `vs/${c.id}`,
      card: { eyebrow: "Comparison", title: c.data.h1, subtitle: c.data.intro },
    })),
  ];

  return cards.map(({ slug, card }) => ({ params: { slug }, props: card }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgCard(props as OgCard);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
