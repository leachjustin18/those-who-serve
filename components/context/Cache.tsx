"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { TMan, TSchedule, TDeacons, TCommunionFamily } from "@/types";
import { SessionCache } from "@/lib/helpers/Cache";
import { de } from "date-fns/locale";

const MEN_CACHE_KEY = "men";
const SCHEDULES_CACHE_KEY = "schedules";
const DEACONS_CACHE_KEY = "deacons";
const COMMUNION_FAMILIES_CACHE_KEY = "communion-families";

/**
 * Singleton client-side cache instance for men.
 */
const menClientCache = new SessionCache<TMan[]>();

/**
 * Singleton client-side cache instance for schedules.
 */
const schedulesClientCache = new SessionCache<TSchedule[]>();

/**
 * Singleton client-side cache instance for deacons.
 */
const deaconsClientCache = new SessionCache<TDeacons[]>();
const communionFamiliesClientCache = new SessionCache<TCommunionFamily[]>();

/**
 * Shape of the cache context exposed to components.
 */
type CacheContextType = {
  /** Current men list, derived from the client SessionCache. */
  men: TMan[];
  /** Convenience setter to replace the men list in the cache. */
  setMen: (men: TMan[]) => void;
  /** Current schedules list, derived from the client SessionCache. */
  schedules: TSchedule[];
  /** Convenience setter to replace the schedules list in the cache. */
  setSchedules: (schedules: TSchedule[]) => void;
  /** Underlying SessionCache instance, if you need lower-level access. */
  cache: SessionCache<TMan[]>;
  /** Current deacons list, derived from the client SessionCache. */
  deacons: TDeacons[];
  communionFamilies: TCommunionFamily[];
  setCommunionFamilies: (families: TCommunionFamily[]) => void;
};

const CacheContext = createContext<CacheContextType | null>(null);

/**
 * Props for the CacheProvider component.
 */
type CacheProviderProps = {
  /** Initial men list, typically fetched on the server in a layout. */
  initialMen: TMan[];
  /** Initial deacons list, typically fetched on the server in a layout. */
  initialDeacons: TDeacons[];
  /** Initial schedule list, typically fetched on the server in a layout. */
  initialSchedules: TSchedule[];
  initialCommunionFamilies?: TCommunionFamily[];
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
export const CacheProvider = ({ initialMen, initialDeacons, initialSchedules, initialCommunionFamilies = [], children }: CacheProviderProps) => {
  // Version counter to force re-renders when the SessionCache notifies.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Seed the client cache if it does not already have men.
    const existing = menClientCache.get(MEN_CACHE_KEY);
    if (!existing || existing.length === 0) {
      menClientCache.set(MEN_CACHE_KEY, initialMen);
    }
    if (!schedulesClientCache.get(SCHEDULES_CACHE_KEY)) {
      schedulesClientCache.set(SCHEDULES_CACHE_KEY, initialSchedules);
    }
    if (!deaconsClientCache.get(DEACONS_CACHE_KEY)) {
      deaconsClientCache.set(DEACONS_CACHE_KEY, initialDeacons);
    }
    if (!communionFamiliesClientCache.get(COMMUNION_FAMILIES_CACHE_KEY)) {
      communionFamiliesClientCache.set(COMMUNION_FAMILIES_CACHE_KEY, initialCommunionFamilies);
    }

    // Subscribe to cache changes; bump version on each change.
    const unsubscribeMen = menClientCache.subscribe(() => {
      setVersion((v) => v + 1);
    });

    const unsubscribeSchedules = schedulesClientCache.subscribe(() => {
      setVersion((v) => v + 1);
    });
    const unsubscribeFamilies = communionFamiliesClientCache.subscribe(() => {
      setVersion((v) => v + 1);
    });

    return () => {
      unsubscribeMen();
      unsubscribeSchedules();
      unsubscribeFamilies();
    };
  }, [initialMen, initialSchedules, initialDeacons, initialCommunionFamilies]);

  const value = useMemo<CacheContextType>(() => {
    const _ = version; // force-reactive dependency

    const men = menClientCache.get(MEN_CACHE_KEY) ?? initialMen ?? [];
    const schedules = schedulesClientCache.get(SCHEDULES_CACHE_KEY) ?? initialSchedules ?? [];
    const deacons = deaconsClientCache.get(DEACONS_CACHE_KEY) ?? initialDeacons ?? [];
    const communionFamilies = communionFamiliesClientCache.get(COMMUNION_FAMILIES_CACHE_KEY) ?? initialCommunionFamilies ?? [];


    const setMen = (next: TMan[]) => {
      menClientCache.set(MEN_CACHE_KEY, next);
    };

    const setSchedules = (next: TSchedule[]) => {
      schedulesClientCache.set(SCHEDULES_CACHE_KEY, next);
    };
    const setCommunionFamilies = (next: TCommunionFamily[]) => {
      communionFamiliesClientCache.set(COMMUNION_FAMILIES_CACHE_KEY, next);
    };

    return {
      men,
      setMen,
      schedules,
      setSchedules,
      deacons,
      communionFamilies,
      setCommunionFamilies,
      cache: menClientCache,
    };
  }, [version, initialMen, initialSchedules, initialDeacons, initialCommunionFamilies]);


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
