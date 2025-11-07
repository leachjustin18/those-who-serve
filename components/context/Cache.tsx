"use client";

import { createContext, useContext, useRef } from "react";
import type { Man } from "@/types/man";
type CacheContextType = {
  men: Man[];
};

const CacheContext = createContext<CacheContextType | null>(null);

export const CacheProvider = ({
  initialCache,
  children,
}: {
  initialCache: CacheContextType;
  children: React.ReactNode;
}) => {
  const cacheRef = useRef(initialCache);

  return (
    <CacheContext.Provider value={cacheRef.current}>
      {children}
    </CacheContext.Provider>
  );
};

export function useCache(): CacheContextType {
  const cache = useContext(CacheContext);
  if (!cache) throw new Error("useCache must be used within a CacheProvider");
  return cache;
}
