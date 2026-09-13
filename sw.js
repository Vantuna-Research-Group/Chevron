/* Field Notes service worker.
   Bump APP_VERSION on every deploy. Old caches are removed on activate.
   A new version does not take over a running app. It waits until every
   tab is closed, so nobody gets swapped mid-station. */

const APP_VERSION = "2026-09-13j";
const CACHE = "fieldnotes-" + APP_VERSION;

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(SHELL))
  );
  // No skipWaiting on purpose. See the note above.
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.startsWith("fieldnotes-") && k !== CACHE)
          .map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener("message", e=>{
  if(e.data === "version"){
    const msg = {version: APP_VERSION};
    // The page sends a MessagePort. Replying on e.source instead would
    // go to the document's message handler and never reach that port.
    if(e.ports && e.ports[0]) e.ports[0].postMessage(msg);
    else if(e.source) e.source.postMessage(msg);
  }
  if(e.data === "activate-update"){
    self.skipWaiting();
  }
});

self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);

  // Tide predictions are never cached here. The app stores the day's
  // table in localStorage itself, and a stale cached response would be
  // worse than a clean failure.
  if(url.hostname.endsWith("tidesandcurrents.noaa.gov")) return;

  if(e.request.method !== "GET") return;
  if(url.origin !== self.location.origin) return;

  // Cache first. The app shell is one file and changes only on deploy,
  // so speed and offline certainty matter more than freshness.
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(hit=>{
      if(hit) {
        // Refresh the copy in the background for the next cold start.
        fetch(e.request).then(r=>{
          if(r && r.ok) caches.open(CACHE).then(c=>c.put(e.request, r));
        }).catch(()=>{});
        return hit;
      }
      return fetch(e.request).then(r=>{
        if(r && r.ok && r.type === "basic"){
          const copy = r.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copy));
        }
        return r;
      }).catch(()=>caches.match("./index.html"));
    })
  );
});
