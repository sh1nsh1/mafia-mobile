import { useEffect, useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";

type StoreWithPersist<T> = UseBoundStore<
  StoreApi<T> & {
    persist: {
      hasHydrated: () => boolean;
      rehydrate: () => void | Promise<void>;
      onHydrate: (listener: (state: T) => void) => () => void;
      onFinishHydration: (listener: (state: T) => void) => () => void;
    };
  }
>;

/**
 * Для отслеживание состояния Zustand с persist
 */
export function useHydration<T>(store: StoreWithPersist<T>) {
  const [isHydrated, setIsHydrated] = useState(store.persist.hasHydrated());

  useEffect(() => {
    store.persist.onHydrate(() => setIsHydrated(false));
    store.persist.onFinishHydration(() => setIsHydrated(true));
  }, []);

  return isHydrated;
}
