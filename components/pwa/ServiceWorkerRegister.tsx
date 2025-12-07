"use client";
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js", {
            updateViaCache: 'none' // Prevents caching during development
          });
        } catch (err) {
          console.error("Service worker registration failed", err);
        }
      };
      register();
    }
  }, []);

  return null;
}