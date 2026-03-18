import { useThemeStore } from "@/stores/theme";
import { ViewStyle, StyleSheet, View } from "react-native";

type SeparatorProps = ViewStyle & {
  height?: number;
  color?: string;
  style?: ViewStyle;
};

export default function Separator(props: SeparatorProps) {
  const colors = useThemeStore(theme => theme.colors);
  const { height = 1, color = colors.foregroundSecondary, style, ...rest } = props;

  return (
    <View
      style={[
        styles.separator,
        {
          height,
          backgroundColor: color,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
  },
});
