import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { useThemeStore } from "@/stores/theme";

export default function Spinner(props: ActivityIndicatorProps) {
  const colors = useThemeStore(theme => theme.colors);

  return <ActivityIndicator color={colors.accentPrimary} {...props} />;
}
