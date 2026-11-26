/* Offline support: caches the app files. Bump VERSION after every content change
   so phones pick up the new lessons. */
const VERSION = "itsa-2026-11-26-1";
const FILES = [
  "./", "index.html", "css/style.css", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
  "js/app.js", "js/srs.js", "js/priority.js",
  "data/plan.js", "data/lessons.js", "data/itil.js", "data/german.js", "data/tickets.js", "data/interview.js"
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
/* Network first (fresh lessons when online), cache when offline. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
