/**
 * Elexcom Vehicle Daily Inspection — Service Worker
 * Caches the app shell so the form works offline (in the truck, on site, etc.).
 * Bump CACHE_VERSION when you change index.html, manifest.json or icons.
 */
const CACHE_VERSION = "elx-inspect-v1.1.0";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];
const RUNTIME_CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(async cache => {
        try { await cache.addAll(CORE_ASSETS); }
        catch (err) { console.warn("[SW] core assets caching issue:", err); }
        // Cache CDN libraries opportunistically; do not fail install if offline.
        await Promise.all(RUNTIME_CDN.map(url =>
          fetch(url, { mode: "cors" }).then(res => {
            if (res && res.ok) cache.put(url, res.clone());
          }).catch(() => {})
        ));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Network-first for HTML so updates appear quickly online,
  // cache-first for everything else (icons, manifest, libs).
  const isHtml = request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isHtml) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then(r => r || caches.match("./index.html")))
    );
  } else {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(res => {
          // Cache same-origin and cross-origin (CDN) successful responses
          if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(request, copy));
          }
          return res;
        });
      }).catch(() => caches.match("./index.html"))
    );
  }
});
