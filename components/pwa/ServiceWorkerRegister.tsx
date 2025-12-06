"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (err) {
          console.error("Service worker registration failed", err);
        }
      };

      register();
    }
  }, []);

  return null;
}
