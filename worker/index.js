/**
 * Entry for the Cloudflare Worker that serves the static site.
 *
 * Its only job is to send www.pocketchomp.com to the apex with a 301 and pass
 * every other request straight through to the static assets. It runs before
 * the asset lookup (`run_worker_first` in wrangler.jsonc) because otherwise a
 * matching asset is served without ever invoking this code.
 */
const CANONICAL_HOST = "pocketchomp.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
