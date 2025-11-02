"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache, { type EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider, GlobalStyles } from "@mui/material";
import { theme } from "@/lib/theme"

type CacheState = {
  cache: EmotionCache;
  flush: () => string[];
};

const createEmotionCache = (): EmotionCache => {
  const cache = createCache({ key: "mui", prepend: true });
  cache.compat = true;
  return cache;
};

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = React.useState<CacheState>(() => {
    const cache = createEmotionCache();
    const prevInsert = cache.insert;
    const inserted: string[] = [];

    cache.insert = (selector, serialized, sheet, shouldCache) => {
      if (cache.inserted[serialized.name] === undefined)
        inserted.push(serialized.name);
      return prevInsert.call(cache, selector, serialized, sheet, shouldCache);
    };

    return {
      cache,
      flush: () => {
        if (!inserted.length) return [];
        const names = [...inserted];
        inserted.length = 0;
        return names;
      },
    };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;

    const styles = names.reduce((acc, name) => {
      const style = cache.inserted[name];
      return typeof style === "string" ? acc + style : acc;
    }, "");

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            "*,*::before,*::after": { boxSizing: "border-box" },
            html: { height: "100%" },
            body: { height: "100%" },
          }}
        />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
