const CACHE_NAME = "those-who-serve-public-v3";
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
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache the explicitly public install assets. API responses, HTML,
  // authenticated pages, and Next.js build assets always use the network.
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  const pathname = new URL(request.url).pathname;
  if (!ASSETS_TO_CACHE.includes(pathname)) return;

  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});
