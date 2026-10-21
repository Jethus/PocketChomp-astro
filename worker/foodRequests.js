/**
 * POST /api/food-request: a visitor asks for a store or restaurant to be
 * added to the food database (form at the bottom of /database).
 *
 * Stores the text and the time in D1 (REQUESTS_DB) and nothing else. Spam
 * guards: a hidden honeypot field, a 50-character cap, and Cloudflare's
 * per-IP rate limiter (REQUEST_LIMITER), which counts in memory and stores no
 * IP. Script-driven submits ask for JSON; a plain form post gets a 303 back
 * to the page with ?requested=ok|limit|error so it still works without JS.
 */
// A store or restaurant name, not a message.
const MAX_LENGTH = 50;
const RETURN_PATH = "/database";

function reply(request, url, status, outcome) {
  if ((request.headers.get("Accept") ?? "").includes("application/json")) {
    return Response.json({ ok: outcome === "ok", outcome }, { status });
  }
  const back = new URL(RETURN_PATH, url);
  back.searchParams.set("requested", outcome);
  back.hash = "request";
  return Response.redirect(back.toString(), 303);
}

export async function handleFoodRequest(request, env, url) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(request, url, 400, "error");
  }

  // Bots fill every field; people never see this one. Answer as if it worked.
  if (String(form.get("website") ?? "").trim() !== "") {
    return reply(request, url, 200, "ok");
  }

  const text = String(form.get("request") ?? "").replace(/\s+/g, " ").trim();
  if (text.length < 2 || text.length > MAX_LENGTH) {
    return reply(request, url, 400, "error");
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const { success } = await env.REQUEST_LIMITER.limit({ key: ip });
  if (!success) {
    return reply(request, url, 429, "limit");
  }

  try {
    await env.REQUESTS_DB.prepare("INSERT INTO food_requests (text) VALUES (?)").bind(text).run();
  } catch (error) {
    console.error("food request insert failed", error);
    return reply(request, url, 500, "error");
  }
  return reply(request, url, 200, "ok");
}
