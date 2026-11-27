/* Offline support: caches the app files. Bump VERSION after every content change
   so phones pick up the new lessons. */
const VERSION = "itsa-2026-11-27-16";
const FILES = [
  "./", "index.html", "css/style.css", "manifest.webmanifest", "icons/icon-v2.svg", "icons/icon-192-v2.png", "icons/icon-512-v2.png", "icons/icon-maskable-512-v2.png", "icons/apple-touch-icon-v2.png",
  "js/icons.js", "js/motion.js", "js/trainers.js", "js/ki.js", "js/app.js", "js/srs.js", "js/priority.js",
  "data/plan.js", "data/lessons.js", "data/itil.js", "data/german.js", "data/deutsch-a2.js", "data/deutsch-b1.js", "data/tickets.js", "data/interview.js", "data/runbooks.js", "data/deepdives.js", "data/guides.js", "data/diagrams.js", "data/courses-m365.js", "data/courses-sys.js", "data/courses-net.js", "data/courses-azure-linux.js", "data/courses-senior.js", "data/tracks.js"
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
/* Network first (fresh lessons when online), cache when offline. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache" }).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
