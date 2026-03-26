import { useThemeStore } from "@/stores/theme-store";
import { darkColors, lightColors, Palette } from "@/utils/theme";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

export function useTheme() {
  const systemTheme = useColorScheme();
  const { theme: userTheme, setTheme } = useThemeStore();

  const theme: "dark" | "light" = useMemo(() => {
    if (userTheme === null || userTheme === "system") {
      return systemTheme !== "unspecified" ? systemTheme : "dark";
    }

    return userTheme;
  }, [systemTheme, userTheme]);

  const colors: Palette = useMemo(
    () => (theme === "dark" ? darkColors : lightColors),
    [theme],
  );

  return { colors, theme, setTheme };
}
