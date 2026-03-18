import { useThemeStore } from "@/stores/theme";
import Button from "./Button";
import { Ionicons } from "@expo/vector-icons";

export function ThemeToggler() {
  const { theme, colors, setTheme } = useThemeStore();

  const next = (): "light" | "dark" | "system" => {
    if (theme === "light") return "dark";
    if (theme === "dark") return "system";
    return "light";
  };

  const onPress = () => {
    setTheme(next());
  };

  return (
    <Button
      icon={
        theme === "dark" ? (
          <Ionicons name="moon-outline" size={24} color={colors.textPrimary} />
        ) : theme === "light" ? (
          <Ionicons name="sunny-outline" size={24} color={colors.textPrimary} />
        ) : (
          <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
        )
      }
      onPress={onPress}
    >
      {theme === "light" ? "Светлая" : theme === "dark" ? "Тёмная" : "Системная"}
    </Button>
  );
}
