"use client";

import { useEffect, useRef } from "react";
import { useOrbitaStore } from "@/lib/store";

export function StoreHydration() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Force rehydration check on client
      const state = useOrbitaStore.getState();
      if (!state._hasHydrated) {
        state.setHasHydrated(true);
      }
    }
  }, []);

  return null;
}
