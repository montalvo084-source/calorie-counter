"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { FoodSource } from "./types";

interface FoodSourcesContextValue {
  sources: FoodSource[];
  loaded: boolean;
  reload: () => void;
}

const FoodSourcesContext = createContext<FoodSourcesContextValue>({
  sources: [],
  loaded: false,
  reload: () => {},
});

export function FoodSourcesProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = useState<FoodSource[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/food-sources");
    if (res.ok) {
      const data = await res.json();
      setSources(data);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FoodSourcesContext.Provider value={{ sources, loaded, reload: load }}>
      {children}
    </FoodSourcesContext.Provider>
  );
}

export function useFoodSources() {
  return useContext(FoodSourcesContext);
}
