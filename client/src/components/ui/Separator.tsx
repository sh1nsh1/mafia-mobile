import { useThemeStore } from "@/stores/theme-store";
import { ViewStyle, StyleSheet, View, ViewProps } from "react-native";

type SeparatorProps = ViewStyle & {
  height?: number;
  color?: string;
  style?: ViewStyle;
};

export default function Separator(props: SeparatorProps) {
  const colors = useThemeStore(theme => theme.colors);
  const { height = 1, color = colors.borderPrimary, style, ...rest } = props;
  const separatorStyle: ViewProps["style"] = [
    styles.separator,
    {
      height,
      backgroundColor: color,
      shadowColor: colors.accentSecondary,
    },
    style,
  ];

  return <View style={separatorStyle} {...rest} />;
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
  },
});
