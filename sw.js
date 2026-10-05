/* Tiene l'app disponibile anche senza internet */
const CACHE = "presenze-v46";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./favicon-48.png"];
/* oltre ai file dell'app salvo solo font e librerie: le connessioni a Firebase (login, dati) passano dirette */
const CDN = ["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !CDN.includes(u.hostname)) return;
  /* prima la rete (così prendi sempre la versione nuova), poi la copia salvata */
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
