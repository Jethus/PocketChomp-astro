/**
 * Entry for the Cloudflare Worker that serves the static site.
 *
 * It sends www.pocketchomp.com to the apex with a 301, upgrades the asset
 * layer's trailing-slash 307 to a permanent 308, and otherwise passes requests
 * straight through to the static assets. It runs before
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
    const response = await env.ASSETS.fetch(request);

    // Cloudflare Assets (html_handling "drop-trailing-slash") answers /tools/
    // with a 307 to /tools. 307 is temporary — Google keeps indexing both URLs.
    // Reissue as 308 (permanent) so the slash form is consolidated away.
    if (response.status === 307) {
      const location = response.headers.get("Location");
      if (location) {
        return Response.redirect(new URL(location, url).toString(), 308);
      }
    }

    return response;
  },
};
