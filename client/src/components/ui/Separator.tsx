import { ViewStyle, StyleSheet, View } from "react-native";
import { pallete } from "@/utils/palette";

type SeparatorProps = ViewStyle & {
  height?: number;
  color?: string;
  style?: ViewStyle;
};

export default function Separator({
  height = 1,
  color = pallete.darkred,
  style,
  ...rest
}: SeparatorProps) {
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
