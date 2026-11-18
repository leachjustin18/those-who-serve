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
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("those-who-serve-"))
          .map((name) => caches.delete(name)),
      );
    }
  } catch (err) {
    console.error("Failed to clear auth cache", err);
  }
};
