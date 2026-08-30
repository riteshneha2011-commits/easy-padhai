// Easy Padhai Bulletproof Offline Service Worker v3
const CACHE_NAME = "easy-padhai-v3";
const STATIC_ASSETS = [
  "/offline.html",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/easy-padhai-mark.png",
  "/manifest.json",
];

// Install: Pre-cache standalone offline player
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: Take immediate control of all open tabs/PWA windows
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Handle navigation and assets with offline fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Exclude Supabase / auth / external analytics from SW intercept
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase.co")) {
    return;
  }

  // 1. Navigation requests (Opening the app, clicking links, or refreshing)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page visits for offline re-use
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(async () => {
          // OFFLINE: First try cached page, then fallback to standalone offline.html
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlineShell = await caches.match("/offline.html");
          if (offlineShell) return offlineShell;

          return new Response("Offline Mode Active", {
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and update in background (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache, fetch from network and cache
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return empty or fallback if asset fetch fails offline
          return new Response("", { status: 408, statusText: "Offline" });
        });
    })
  );
});
