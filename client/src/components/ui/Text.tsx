import { useTheme } from "@/hooks/useTheme";
import { HEADER_FONT, PARAGRAPH_FONT } from "@/utils/theme";
import {
  Text as RnText,
  TextProps as RnTextProps,
  TextStyle,
  StyleProp,
} from "react-native";

type TextProps = RnTextProps & {
  align?: TextStyle["textAlign"];
  size?: number;
  weight?: TextStyle["fontWeight"];
  header?: boolean;
};

export function Text(props: TextProps) {
  const { children, style, weight = 500, header, size = 18, align, ...rest } = props;
  const { colors } = useTheme();

  const textStyle: StyleProp<TextStyle> = [
    {
      fontSize: size,
      fontWeight: weight,
      fontFamily: header ? HEADER_FONT : PARAGRAPH_FONT,
      textAlign: align,
      color: colors.textPrimary,
      letterSpacing: header ? 3 : 1,
    },
    style,
  ];

  return (
    <RnText style={textStyle} {...rest}>
      {children}
    </RnText>
  );
}
