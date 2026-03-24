import { useThemeStore } from "@/stores/theme-store";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui";

export function ThemeToggler() {
  const { theme, colors, setTheme } = useThemeStore();

  return (
    <Button
      icon={
        theme === "dark" ? (
          <Ionicons name="moon-outline" size={24} color={colors.textPrimary} />
        ) : (
          <Ionicons name="sunny-outline" size={24} color={colors.textPrimary} />
        )
      }
      pressableStyle={{ alignSelf: "center" }}
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
    />
  );
}
