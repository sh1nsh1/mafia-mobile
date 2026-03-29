import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserTheme = "light" | "dark" | "system";

export type ThemeStore = {
  theme: UserTheme | null;
  setTheme: (theme: UserTheme) => void;
};

/** Не использовать напрямую */
export const useThemeStore = create(
  persist<ThemeStore>(
    set => ({
      theme: null,
      setTheme: theme => set({ theme }),
    }),
    {
      name: "mafia-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
