import { getCollection } from "astro:content";

import { isLive } from "./release";

/** Every blog post that is not marked `draft: true` or dated ahead, newest first. */
export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft && isLive(data.pubDate));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
