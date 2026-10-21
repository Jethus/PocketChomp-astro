import { getCollection } from "astro:content";

/**
 * Every blog post that is not marked `draft: true` and whose `pubDate` has
 * arrived, newest first. A future-dated post stays out of the index, the
 * homepage teaser, llms.txt, its own page and the sitemap until the first
 * build on or after that date, so a post can be merged ahead of its day.
 */
export async function getPublishedPosts(now: Date = new Date()) {
  const posts = await getCollection(
    "blog",
    ({ data }) => !data.draft && data.pubDate.valueOf() <= now.valueOf(),
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
