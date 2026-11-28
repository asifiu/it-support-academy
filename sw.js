/* Offline support: caches the app files. Bump VERSION after every content change
   so phones pick up the new lessons. */
const VERSION = "itsa-2026-11-29-6";
const FILES = [
  "./", "index.html", "css/style.css", "manifest.webmanifest", "icons/icon-v2.svg", "icons/icon-192-v2.png", "icons/icon-512-v2.png", "icons/icon-maskable-512-v2.png", "icons/apple-touch-icon-v2.png",
  "js/i18n.js", "js/icons.js", "js/motion.js", "js/trainers.js", "js/ki.js", "js/vendor/anthropic-sdk-1.14.0.js", "js/app.js", "js/srs.js", "js/priority.js",
  "data/plan.js", "data/lessons.js", "data/itil.js", "data/german.js", "data/deutsch-a2.js", "data/deutsch-b1.js", "data/deutsch-verbs.js", "data/tickets.js", "data/interview.js", "data/runbooks.js", "data/deepdives.js", "data/guides.js", "data/diagrams.js", "data/courses-m365.js", "data/courses-sys.js", "data/courses-net.js", "data/courses-azure-linux.js", "data/courses-senior.js", "data/courses-iam.js", "data/courses-mdm.js", "data/courses-itsm.js", "data/courses-cases.js", "data/courses-ad-deep.js", "data/courses-exo-deep.js", "data/tracks.js", "data/wortschatz-1.js", "data/wortschatz-2.js", "data/wortschatz-3.js", "data/wortschatz-4.js", "data/wortschatz-5.js", "data/wortschatz-6.js", "data/wortschatz-7.js", "data/wortschatz-8.js", "data/wortschatz-9.js", "data/wortschatz-10.js", "data/wortschatz-11.js", "data/wortschatz-12.js", "data/wortschatz-13.js", "js/wortschatz.js", "data/desk.js", "js/desk.js"
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
/* Stale-while-revalidate: answer instantly from the cache, refresh the cache in the background.
   New content appears on the next start (VERSION bump also forces a fresh install). */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request.url, { cache: "no-cache" }).then((r) => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
