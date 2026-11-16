/**
 * Fires a Plausible "Play Store Click" event when someone follows a link to the
 * Google Play listing. Links opt in with `data-play-link`; `data-placement` and
 * `data-content` (a restaurant chain's slug, say) become event properties, the
 * same names the link's install referrer carries, so a click here and an
 * install in Play Console can be read side by side per placement.
 */
document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-play-link]");
  if (!link) return;
  const props: Record<string, string> = { placement: link.dataset.placement || "unknown" };
  if (link.dataset.content) props.content = link.dataset.content;
  window.plausible?.("Play Store Click", { props });
});

export {};
