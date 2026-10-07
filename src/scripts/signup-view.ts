/**
 * Fires a Plausible "Signup Form Viewed" event the first time each signup form
 * scrolls into view. Lives in SignupForm.astro's <script> so every mount of the
 * form, wherever it sits on the page, gets the same detection without the page
 * having to know about it. Astro bundles the module once per page even when the
 * component is used several times, and hashes it for the CSP.
 *
 * The `placement` prop on the form becomes an event property, so Plausible can
 * break the goal down by where the form was seen and the ratio
 * "Form: Submission" / "Signup Form Viewed" gives a per-placement conversion
 * rate. Kit's own form analytics need Kit's embed script, which this site does
 * not load.
 */
const forms = document.querySelectorAll<HTMLFormElement>("form[data-signup-form]");

if (forms.length > 0 && "IntersectionObserver" in window) {
  const seen = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const form = entry.target as HTMLElement;
        observer.unobserve(form);

        const placement = form.dataset.placement || "unknown";
        if (seen.has(placement)) continue;
        seen.add(placement);

        window.plausible?.("Signup Form Viewed", { props: { placement } });
      }
    },
    // Half the form visible counts as "seen"; it is only a couple of lines tall
    { threshold: 0.5 },
  );

  forms.forEach((form) => observer.observe(form));
}

export {};
