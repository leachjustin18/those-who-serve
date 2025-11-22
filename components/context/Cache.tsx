"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Man } from "@/types/man";
import { SessionCache } from "@/lib/helpers/Cache";

const MEN_CACHE_KEY = "men";

/**
 * Singleton client-side cache instance for men.
 *
 * This lives in the browser runtime (per tab) and is separate from any
 * server-side logic.
 */
const menClientCache = new SessionCache<Man[]>();

/**
 * Shape of the cache context exposed to components.
 */
type CacheContextType = {
  /** Current men list, derived from the client SessionCache. */
  men: Man[];
  /** Convenience setter to replace the men list in the cache. */
  setMen: (men: Man[]) => void;
  /** Underlying SessionCache instance, if you need lower-level access. */
  cache: SessionCache<Man[]>;
};

const CacheContext = createContext<CacheContextType | null>(null);

/**
 * Props for the CacheProvider component.
 */
type CacheProviderProps = {
  /** Initial men list, typically fetched on the server in a layout. */
  initialMen: Man[];
  /** React children rendered within the provider. */
  children: React.ReactNode;
};

/**
 * CacheProvider seeds the client-side SessionCache with server-fetched data
 * and subscribes to cache changes so that consumers re-render when the cache
 * is mutated (e.g., from another page).
 *
 * Use this in a shared layout so all pages under it see the same men data.
 */
export const CacheProvider = ({ initialMen, children }: CacheProviderProps) => {
  // Version counter to force re-renders when the SessionCache notifies.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Seed the client cache if it does not already have men.
    const existing = menClientCache.get(MEN_CACHE_KEY);
    if (!existing || existing.length === 0) {
      menClientCache.set(MEN_CACHE_KEY, initialMen);
    }

    // Subscribe to cache changes; bump version on each change.
    const unsubscribe = menClientCache.subscribe(() => {
      setVersion((v) => v + 1);
    });

    return unsubscribe;
  }, [initialMen]);

const value = useMemo<CacheContextType>(() => {
  const _ = version; // force-reactive dependency

  const men = menClientCache.get(MEN_CACHE_KEY) ?? initialMen ?? [];

  const setMen = (next: Man[]) => {
    menClientCache.set(MEN_CACHE_KEY, next);
  };

  return {
    men,
    setMen,
    cache: menClientCache,
  };
}, [version, initialMen]);


  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};

/**
 * Hook to access the men cache from within components.
 *
 * @throws If used outside of a CacheProvider.
 */
export function useCache(): CacheContextType {
  const cache = useContext(CacheContext);
  if (!cache) throw new Error("useCache must be used within a CacheProvider");
  return cache;
}
