const CACHE_NAME = "those-who-serve-v1";
const ASSETS_TO_CACHE = [
  "/manifest.webmanifest",
  "/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Bypass non-GET and external requests
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // NEVER cache auth routes or protected pages
  if (request.url.includes("/api/auth/") ||
    request.url.includes("/manage-men") ||
    request.url.includes("/auth/")) {
    return; // Always go to network
  }

  // Network-first for API routes
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
  } else {
    // Check if this is an HTML page or a static asset
    const isDocument = request.headers.get('accept')?.includes('text/html');

    if (isDocument) {
      // Network-first for HTML pages (to always check auth state)
      event.respondWith(
        fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => caches.match(request)),
      );
    } else {
      // Cache-first for static assets (CSS, JS, images, fonts)
      event.respondWith(
        caches.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          });
        }),
      );
    }
  }
});
