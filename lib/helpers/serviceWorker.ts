/**
 * Unregisters all service workers and clears all caches.
 */
export const clearServiceWorkersAndCache = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
    if (typeof caches !== "undefined") {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  } catch (err) {
    console.error("Failed to clear service workers or cache", err);
  }
};

export const clearAuthCache = async () => {
  try {
    if (typeof caches !== "undefined") {
      const cache = await caches.open("those-who-serve-v1");
      const requests = await cache.keys();

      await Promise.all(
        requests
          .filter(req =>
            req.url.includes("/manage-men") ||
            req.url.includes("/auth/") ||
            req.url.includes("/api/")
          )
          .map(req => cache.delete(req))
      );
    }
  } catch (err) {
    console.error("Failed to clear auth cache", err);
  }
};