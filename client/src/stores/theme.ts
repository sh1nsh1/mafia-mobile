import { create } from "zustand";
import { Appearance } from "react-native";
import { ThemeMode, lightColors, darkColors } from "@/utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ASYNC_STORAGE_KEY = "theme";

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
    const theme = (await AsyncStorage.getItem(ASYNC_STORAGE_KEY)) as ThemeMode;

    const systemTheme = Appearance.getColorScheme();
    const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

    set({
      theme,
      colors: isDark ? darkColors : lightColors,
      isInitialized: true,
    });
  },

  setTheme: (theme: ThemeMode) => {
    const systemTheme = Appearance.getColorScheme();
    const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

    AsyncStorage.setItem(ASYNC_STORAGE_KEY, theme);

    set({
      theme,
      colors: isDark ? darkColors : lightColors,
    });
  },
}));
