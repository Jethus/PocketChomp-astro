// Reveal-on-scroll driver. Sections opt in with data-reveal-root on a container
// and data-reveal (+ optional --reveal-delay) on children. The html.js-reveal
// class gates the hidden initial state so content stays visible without JS.
const roots = document.querySelectorAll<HTMLElement>("[data-reveal-root]");

if (roots.length > 0) {
  document.documentElement.classList.add("js-reveal");

  const reveal = (el: Element) => el.classList.add("is-revealed");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 }
    );
    roots.forEach((root) => io.observe(root));
  } else {
    roots.forEach(reveal);
  }
}
