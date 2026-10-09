// Easy Padhai Bulletproof Offline Service Worker v11
const CACHE_NAME = "easy-padhai-v11";
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

// Activate: Take immediate control of all open tabs/PWA windows and purge stale caches
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

  // Exclude Supabase, Cloudflare R2, server functions, and dynamic data APIs from SW intercept
  if (
    url.pathname.startsWith("/_server") ||
    url.pathname.startsWith("/api") ||
    url.searchParams.has("_serverFnId") ||
    url.searchParams.has("_data") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("r2.dev")
  ) {
    return; // Pass through directly to live network
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

  // 2. Static Assets ONLY (JS, CSS, images, fonts, audio files, icons)
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/_build/") ||
    /\.(js|css|woff2?|ttf|png|jpe?g|gif|svg|ico|webp|mp3|m4a|wav|json)$/i.test(url.pathname);

  if (!isStaticAsset) {
    // Non-static routes should never be cached as static assets
    return;
  }

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
