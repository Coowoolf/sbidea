"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  loadAdventure,
  saveAdventure,
  recordStop as _recordStop,
  type AdventureState,
} from "@/lib/adventure";

type AdventureCtx = {
  adventure: AdventureState | null;
  setAdventure: (s: AdventureState | null) => void;
  recordStop: (
    product: string,
    summary: string,
    data: Record<string, unknown>,
  ) => void;
  isActive: boolean;
};

const Ctx = createContext<AdventureCtx>({
  adventure: null,
  setAdventure: () => {},
  recordStop: () => {},
  isActive: false,
});

export function AdventureProvider({ children }: { children: ReactNode }) {
  const [adventure, setAdventureRaw] = useState<AdventureState | null>(null);

  useEffect(() => {
    setAdventureRaw(loadAdventure());
  }, []);

  const setAdventure = useCallback((s: AdventureState | null) => {
    setAdventureRaw(s);
    if (s) saveAdventure(s);
  }, []);

  const recordStop = useCallback(
    (product: string, summary: string, data: Record<string, unknown>) => {
      _recordStop(product, summary, data);
      setAdventureRaw(loadAdventure());
    },
    [],
  );

  return (
    <Ctx value={{ adventure, setAdventure, recordStop, isActive: !!adventure }}>
      {children}
    </Ctx>
  );
}

export function useAdventure() {
  return useContext(Ctx);
}
