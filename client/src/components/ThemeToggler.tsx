import { Ionicons } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useCallback } from "react";
import { UserTheme, useThemeStore } from "@/stores/theme-store";

const themeNames = {
  light: "Светлая",
  dark: "Темная",
  system: "Системная",
};

const iconNames = {
  light: "sunny-outline",
  dark: "moon-outline",
  system: "git-compare-outline",
};

export function ThemeToggler() {
  const { theme: appTheme, setTheme } = useTheme();
  const storedTheme = useThemeStore(s => s.theme);

  const theme = storedTheme ?? appTheme;

  const setNextTheme = useCallback(() => {
    let nextTheme: UserTheme = "light";

    if (theme === "light") nextTheme = "dark";
    if (theme === "dark") nextTheme = "system";

    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <Button
      icon={<Ionicons name={iconNames[theme] as any} size={24} />}
      pressableStyle={{ alignSelf: "center" }}
      onPress={setNextTheme}
    >
      {themeNames[theme]}
    </Button>
  );
}
