// HATCH — Cloudflare Worker (LEGACY DOMAIN).
// Keeps the old shared link (hatch-pet.samfirn.workers.dev) alive and always
// current by proxying the canonical Cloudflare Pages deployment. It also serves
// the PWA files (manifest, service worker, icon) inline so anyone who already
// INSTALLED HATCH from this domain keeps working and auto-updates.
// Canonical app now lives on Pages; deploy there and this follows automatically.

const ORIGIN = "https://hatchpet.pages.dev/";

const MANIFEST = JSON.stringify({
  name: "HATCH",
  short_name: "HATCH",
  description: "Your virtual pet.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#111210",
  theme_color: "#111210",
  icons: [
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
  ]
});

const ICON = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
<rect width='512' height='512' rx='104' fill='#ece4d4'/>
<rect x='120' y='108' width='272' height='288' rx='44' fill='#14130f'/>
<rect x='156' y='144' width='200' height='184' rx='18' fill='#dbeeba'/>
<g fill='#20340f'>
<rect x='228' y='170' width='56' height='16'/><rect x='212' y='186' width='88' height='16'/>
<rect x='204' y='202' width='104' height='72'/><rect x='212' y='274' width='88' height='16'/>
<rect x='228' y='290' width='56' height='12'/></g>
<circle cx='196' cy='436' r='28' fill='#ef6a3d'/><circle cx='316' cy='436' r='28' fill='#ef6a3d'/>
</svg>`;

const SW = `const C='hatch-cache-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.add('/'))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.mode === 'navigate' || u.pathname === '/') {
    e.respondWith(
      fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put('/', cp)); return r; })
                      .catch(() => caches.match('/'))
    );
  }
});`;

export default {
  async fetch(request) {
    const p = new URL(request.url).pathname;

    // Chess Stops shares this domain's GoatCounter site; its pageviews are namespaced under
    // /chessstops. So the dashboard links those rows to hatch-pet.samfirn.workers.dev/chessstops.
    // Bounce those click-throughs to the real Chess Stops app instead of the Hatch app.
    if (p === "/chessstops" || p.startsWith("/chessstops/"))
      return Response.redirect("https://chessstops.pages.dev/", 302);

    if (p === "/manifest.webmanifest")
      return new Response(MANIFEST, { headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=300" } });
    if (p === "/sw.js")
      return new Response(SW, { headers: { "content-type": "text/javascript", "cache-control": "no-cache" } });
    if (p === "/icon.svg" || p === "/favicon.ico" || p === "/favicon.svg")
      return new Response(ICON, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });

    // everything else = the app (single file for all paths)
    const resp = await fetch(ORIGIN, { cf: { cacheTtl: 60, cacheEverything: true } });
    const headers = new Headers(resp.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=60");
    headers.delete("x-frame-options");
    return new Response(resp.body, { status: resp.status, headers });
  },
};
