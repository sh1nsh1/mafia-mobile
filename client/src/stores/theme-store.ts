import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ASYNC_STORAGE_THEME_KEY = "mafia-theme";

type UserTheme = "light" | "dark" | "system";

type ThemeStore = {
  theme: UserTheme | null;
  setTheme: (theme: UserTheme) => void;

  initialize: () => Promise<void>;
  isInitialized: boolean;
};

export const useThemeStore = create<ThemeStore>(set => ({
  theme: null,
  isInitialized: false,

  initialize: async () => {
    const theme = (await AsyncStorage.getItem(
      ASYNC_STORAGE_THEME_KEY,
    )) as UserTheme | null;

    set({ theme, isInitialized: true });
  },

  setTheme: (theme: UserTheme) => {
    AsyncStorage.setItem(ASYNC_STORAGE_THEME_KEY, theme);
    set({ theme });
  },
}));
