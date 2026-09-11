// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "PocketChomp";
export const SITE_DESCRIPTION =
  "The free calorie counter built for Canadians. Unlimited barcode scanning, 130,000+ foods with 60,000+ from Canadian sources, every micronutrient, and a food log that stays on your device by default. No ads.";

/**
 * Beta signup list. The form posts straight to Kit (ConvertKit) with no
 * JavaScript, so it works under the strict CSP. The form id is public (it is
 * in the page HTML either way); PUBLIC_KIT_FORM_ID overrides it if the form
 * is ever recreated. Kit redirects to /thanks after submit.
 */
const KIT_FORM_ID = (import.meta.env.PUBLIC_KIT_FORM_ID as string | undefined) || "9894910";
export const SIGNUP_FORM_ACTION = `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`;
export const SIGNUP_FORM_METHOD = "post" as const;

/** Cloudflare Web Analytics beacon token (cookieless). Optional. */
export const CF_BEACON_TOKEN = import.meta.env.PUBLIC_CF_BEACON_TOKEN as string | undefined;

/**
 * Plausible (self-hosted at data.pixelboost.dev) — cookieless, no personal
 * data, so no consent banner is required. The host is allow-listed in
 * astro.config.mjs; the init call lives in src/scripts/plausible.ts rather than
 * an inline block so Astro hashes it for the CSP.
 *
 * PUBLIC_PLAUSIBLE_SRC overrides the script URL if the site is recreated.
 */
export const PLAUSIBLE_SRC =
  (import.meta.env.PUBLIC_PLAUSIBLE_SRC as string | undefined) ||
  "https://data.pixelboost.dev/js/pa-M2wuAVVmlh3G_ru432_mv.js";
