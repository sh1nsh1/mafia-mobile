import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { useThemeStore } from "@/stores/theme-store";

export function Spinner(props: ActivityIndicatorProps) {
  const colors = useThemeStore(theme => theme.colors);

  return <ActivityIndicator color={colors.accentPrimary} {...props} />;
}
