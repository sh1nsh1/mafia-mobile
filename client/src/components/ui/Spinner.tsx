import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { useThemeStore } from "@/stores/theme-store";
import { useTheme } from "@/hooks/useTheme";

export function Spinner(props: ActivityIndicatorProps) {
  const { colors } = useTheme();

  return <ActivityIndicator color={colors.accentPrimary} {...props} />;
}
