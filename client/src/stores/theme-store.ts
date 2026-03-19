import { create } from "zustand";
import { Appearance } from "react-native";
import { ThemeMode, lightColors, darkColors } from "@/utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ASYNC_STORAGE_THEME_KEY = "theme";

type ThemeStore = {
  theme: ThemeMode;
  colors: typeof lightColors | typeof darkColors;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>(set => ({
  theme: "dark",
  colors: lightColors,
  isInitialized: false,

  initialize: async () => {
    const theme = (await userTheme()) ?? systemTheme() ?? "dark";

    set({
      theme,
      colors: theme === "dark" ? darkColors : lightColors,
      isInitialized: true,
    });
  },

  setTheme: (theme: ThemeMode) => {
    AsyncStorage.setItem(ASYNC_STORAGE_THEME_KEY, theme);

    set({
      theme,
      colors: theme === "dark" ? darkColors : lightColors,
    });
  },
}));

async function userTheme() {
  return AsyncStorage.getItem(ASYNC_STORAGE_THEME_KEY) as Promise<ThemeMode | null>;
}

function systemTheme() {
  const systemTheme = Appearance.getColorScheme();

  if (systemTheme && systemTheme === "unspecified") {
    return null;
  } else {
    return systemTheme ?? null;
  }
}
