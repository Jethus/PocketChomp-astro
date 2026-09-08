// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "PocketChomp";
export const SITE_DESCRIPTION =
  "The local-first nutrition tracker built for Canadians. Free barcode scanning, 50k+ of Canadian specific groceries. Zero gamification and zero ads. No subscription required.";

/**
 * Beta signup list. The form posts straight to Kit (ConvertKit) with no
 * JavaScript, so it works under the strict CSP. Set PUBLIC_KIT_FORM_ID in
 * the build environment (Cloudflare Pages -> Settings -> Variables) to the
 * numeric id from the Kit form's embed code. Until it is set the form posts
 * to the thank-you page so local builds never 404.
 */
const KIT_FORM_ID = import.meta.env.PUBLIC_KIT_FORM_ID as string | undefined;
export const SIGNUP_FORM_ACTION = KIT_FORM_ID
  ? `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`
  : "/thanks";
export const SIGNUP_FORM_METHOD: "post" | "get" = KIT_FORM_ID ? "post" : "get";

/** Cloudflare Web Analytics beacon token (cookieless). Optional. */
export const CF_BEACON_TOKEN = import.meta.env.PUBLIC_CF_BEACON_TOKEN as string | undefined;
