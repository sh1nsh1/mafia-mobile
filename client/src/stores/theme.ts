import { create } from "zustand";
import { Appearance } from "react-native";
import { ThemeMode, lightColors, darkColors } from "@/utils/theme";

type ThemeStore = {
  theme: ThemeMode;
  colors: typeof lightColors | typeof darkColors;
  setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>(set => ({
  theme: "system",
  colors: lightColors,

  setTheme: (mode: ThemeMode) => {
    const scheme = Appearance.getColorScheme();
    const isDark = mode === "system" ? scheme === "dark" : mode === "dark";

    set({
      theme: mode,
      colors: isDark ? darkColors : lightColors,
    });
  },
}));
