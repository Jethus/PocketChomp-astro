/**
 * Entry for the Cloudflare Worker that serves the static site.
 *
 * It sends www.pocketchomp.com to the apex with a 301, redirects retired
 * pages, upgrades the asset layer's trailing-slash 307 to a permanent 308,
 * takes store/restaurant requests at /api/food-request (foodRequests.js),
 * and otherwise passes requests straight through to the static assets. It runs before
 * the asset lookup (`run_worker_first` in wrangler.jsonc) because otherwise a
 * matching asset is served without ever invoking this code.
 */
import { handleFoodRequest } from "./foodRequests.js";

const CANONICAL_HOST = "pocketchomp.com";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.pocketchomp.app";

// Pages that were published and later removed. Keep old links working.
const RETIRED_PATHS = new Map([
  ["/blog/what-is-free-and-what-is-paid", "/plus"],
]);

/** Clean poster/QR campaign tags from /go/<tag> for Play Store install referrers. */
function parseQrTag(pathname) {
  const raw = pathname.replace(/^\/go\/?/, "").replace(/\/$/, "").toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]/g, "").slice(0, 64);
  return safe || "qr";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    // Catch malformed markdown links like /](https:/pocketchomp.com/) seen in referrers.
    if (url.pathname.startsWith("/](")) {
      return Response.redirect(new URL("/", url).toString(), 301);
    }
    // Smart QR poster redirect: Android goes straight to Play Store with UTM
    // install referrer; iPhone and desktop land on the /go waitlist page while
    // keeping /go/<tag> in the URL so Plausible records which poster was scanned.
    if (url.pathname === "/go" || url.pathname.startsWith("/go/")) {
      const ua = request.headers.get("User-Agent") ?? "";
      if (/android/i.test(ua)) {
        const tag = parseQrTag(url.pathname);
        const utm = `utm_source=poster&utm_medium=qr&utm_campaign=${tag}`;
        return Response.redirect(`${PLAY_STORE_URL}&referrer=${encodeURIComponent(utm)}`, 302);
      }
      return env.ASSETS.fetch(new Request(new URL("/go", url), request));
    }
    if (url.pathname === "/api/food-request") {
      return handleFoodRequest(request, env, url);
    }
    const retired = RETIRED_PATHS.get(url.pathname.replace(/\/$/, ""));
    if (retired) {
      return Response.redirect(new URL(retired, url).toString(), 301);
    }
    // Crawlers guess /sitemap.xml; the build writes sitemap-index.xml. Serve
    // the same index at both so there is no second file to keep in sync.
    if (url.pathname === "/sitemap.xml") {
      return env.ASSETS.fetch(new Request(new URL("/sitemap-index.xml", url), request));
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
