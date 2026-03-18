import { useThemeStore } from "@/stores/theme";
import { HEADER_FONT, PARAGRAPH_FONT } from "@/utils/theme";
import {
  Text as RnText,
  StyleSheet,
  TextProps as RnTextProps,
  TextStyle,
  StyleProp,
} from "react-native";

type TextProps = RnTextProps & {
  align?: TextStyle["textAlign"];
  size?: number;
  header?: boolean;
};

export default function Text(props: TextProps) {
  const { children, style, header, size, align, ...rest } = props;
  const { colors } = useThemeStore();

  const textStyle: StyleProp<TextStyle> = [
    {
      fontSize: size,
      fontFamily: header ? HEADER_FONT : PARAGRAPH_FONT,
      textAlign: align,
      color: colors.textPrimary,
    },
    style,
  ];

  return (
    <RnText style={textStyle} {...rest}>
      {children}
    </RnText>
  );
}

const styles = StyleSheet.create({});
