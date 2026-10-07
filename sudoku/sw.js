// Offline-Speicher: eigene Dateien beim Installieren, Schriften beim ersten Laden
const CACHE = "sudoku-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Seite selbst: erst Netz, damit Updates ankommen; ohne Netz aus dem Speicher
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put("./", copy));
      return r;
    }).catch(() => caches.match("./")));
    return;
  }
  if (url.origin === location.origin || url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return r;
    })));
  }
});
