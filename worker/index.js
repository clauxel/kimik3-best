const SECURITY = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy": "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...SECURITY } });
}

async function analytics(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  if (!env.DB) return json({ ok: false, stored: false, error: "Analytics storage unavailable" }, 503);
  const body = await request.json().catch(() => ({}));
  const allowed = new Set([
    "page_view",
    "route_pick",
    "source_filter",
    "api_cost_plan",
    "architecture_pick",
    "review_classify",
    "companion_pick",
    "watchlist_update",
    "source_card",
    "video_play",
    "internal_link"
  ]);
  const event = allowed.has(body.event) ? body.event : "page_view";
  const path = typeof body.path === "string" ? body.path.slice(0, 180) : "/";
  await env.DB.prepare("INSERT INTO analytics_events (id, name, path, created_at) VALUES (?, ?, ?, datetime('now'))").bind(crypto.randomUUID(), event, path).run();
  return json({ ok: true, stored: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.kimik3.best") {
      url.hostname = "kimik3.best";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/health") return json({ ok: true, service: "kimik3.best", updated: "2026-07-23" });
    if (url.pathname === "/api/analytics/events") return analytics(request, env);
    const response = await env.SITE_ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY)) headers.set(key, value);
    if (response.status === 404) headers.set("x-robots-tag", "noindex,follow");
    return new Response(response.body, { status: response.status, headers });
  }
};
