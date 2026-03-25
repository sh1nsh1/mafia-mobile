import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserTheme = "light" | "dark" | "system";

type ThemeStore = {
  theme: UserTheme | null;
  setTheme: (theme: UserTheme) => void;
};

// export const useThemeStore = create<ThemeStore>(set => ({
//   theme: null,
//   setTheme: theme => set({ theme }),
// }));

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
