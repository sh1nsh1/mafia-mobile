import { useThemeStore } from "@/stores/theme";
import Button from "./Button";
import { Ionicons } from "@expo/vector-icons";

export function ThemeToggler() {
  const { theme, colors, setTheme } = useThemeStore();

  const next = (): "light" | "dark" => {
    if (theme === "light") return "dark";
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
        ) : (
          <Ionicons name="sunny-outline" size={24} color={colors.textPrimary} />
        )
      }
      pressableStyle={{ alignSelf: "center" }}
      onPress={onPress}
    />
  );
}
