import { getCollection } from "astro:content";

/** Every blog post that is not marked `draft: true`, newest first. */
export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
