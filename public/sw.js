// Easy Padhai Advanced Service Worker for 100% Offline App Boot & Asset Caching
const CACHE_NAME = "easy-padhai-app-v2";
const RUNTIME_CACHE = "easy-padhai-runtime-v2";

const APP_SHELL_ASSETS = [
  "/",
  "/learn",
  "/offline",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/easy-padhai-mark.png",
  "/manifest.json",
];

// Install: Cache critical app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        console.warn("App shell partial cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches and claim all clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Smart network-first / cache-fallback for navigation & static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip Supabase API / auth calls from service worker caching
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase.co")) {
    return;
  }

  // 1. Navigation requests (HTML page loads when opening the app)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, copy);
              cache.put("/learn", copy.clone());
              cache.put("/", copy.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // OFFLINE FALLBACK: Return the cached page, or cached /learn, or cached /
          const cached =
            (await caches.match(request)) ||
            (await caches.match("/learn")) ||
            (await caches.match("/"));
          if (cached) return cached;
          return new Response(
            `<!DOCTYPE html>
            <html lang="hi">
              <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>Easy Padhai — Offline Mode</title>
                <style>
                  body { background: #090d16; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
                  .btn { background: #ea580c; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; margin-top: 20px; display: inline-block; border: none; cursor: pointer; }
                </style>
              </head>
              <body>
                <h2>⚡ Easy Padhai Offline Mode</h2>
                <p>आप अभी ऑफलाइन हैं। अपने डाउनलोड किए गए लेक्चर्स देखने के लिए नीचे क्लिक करें।</p>
                <button class="btn" onclick="window.location.reload()">Reload App</button>
              </body>
            </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }

  // 2. Static JS/CSS/Fonts/Images — Cache First with Stale-While-Revalidate
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, copy);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default network fetch with runtime cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
