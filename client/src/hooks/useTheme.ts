import { asyncThemeAtom } from "@/atoms/theme";
import { darkColors, lightColors, Palette } from "@/utils/theme";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

export function useTheme() {
  const systemTheme = useColorScheme();
  const [userTheme, setTheme] = useAtom(asyncThemeAtom);

  const theme: "dark" | "light" = useMemo(() => {
    if (!userTheme || userTheme === "system") {
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
