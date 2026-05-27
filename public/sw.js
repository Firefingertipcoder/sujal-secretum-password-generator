/**
 * ============================================================================
 *               🛡️ OFFLINE SERVICE WORKER CACHE ENGINE
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Dornal
 * Description: Intercepts network fetches to instantly serve layout assets
 *              and WebAssembly byte hashes directly from local cache storage,
 *              supporting 100% offline usage on laptops and mobile devices.
 * 
 * ============================================================================
 */

const CACHE_NAME = "secretum-offline-cache-v1";
const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./site.webmanifest"
];

// Installs cache structures on start
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📥 Service Worker: Priming offline cache databases...");
      return cache.addAll(OFFLINE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Cleans historical old cache indices
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Service Worker: Evicting stale cache indexes: ", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Resonates match checks on fetch intercepts
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        // Guard fetch correctness before caching other resources dynamically
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation if offline and not cached
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
