// Marquee visibility driver. A running CSS animation keeps the compositor
// ticking even when the element is scrolled far out of view, so the rail
// advertises its own visibility and the stylesheet pauses it off-screen.
// Without JS the rail simply animates all the time, exactly as before.
const rails = document.querySelectorAll<HTMLElement>("[data-marquee]");

if (rails.length > 0) {
  if ("IntersectionObserver" in window) {
    // Gate the paused state on this class so a blocked or failed script can
    // never leave the rail frozen.
    document.documentElement.classList.add("js-marquee");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "");
          } else {
            entry.target.removeAttribute("data-visible");
          }
        }
      },
      // A margin so the rail is already moving by the time it scrolls in,
      // rather than visibly starting from a standstill at the edge.
      { rootMargin: "200px 0px" }
    );
    rails.forEach((rail) => io.observe(rail));
  } else {
    rails.forEach((rail) => rail.setAttribute("data-visible", ""));
  }
}
