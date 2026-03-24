import { useThemeStore } from "@/stores/theme-store";
import { darkColors, lightColors, Palette } from "@/utils/theme";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

export function useTheme() {
  const systemTheme = useColorScheme();
  const { theme: userTheme, setTheme } = useThemeStore();

  const theme: "dark" | "light" = useMemo(() => {
    let theme = userTheme;

    if (theme === null || theme === "system") {
      theme = systemTheme !== "unspecified" ? systemTheme : "dark";
    }

    return theme;
  }, [systemTheme, userTheme]);

  const colors: Palette = useMemo(
    () => (theme === "dark" ? darkColors : lightColors),
    [theme],
  );

  return { colors, theme, setTheme };
}
