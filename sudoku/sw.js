// Offline-Speicher: alle Dateien liegen auf dieser Seite, nichts wird von außen geladen
const CACHE = "sudoku-v6";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png",
  "fonts/big-shoulders-display-latin-600-normal.woff2", "fonts/big-shoulders-display-latin-800-normal.woff2",
  "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2",
  "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2"
];

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
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Seite selbst: erst Netz, damit Updates ankommen; ohne Netz aus dem Speicher
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put("./", copy));
      return r;
    }).catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
    return r;
  })));
});
