import { Link as ExpoLink, LinkProps as ExpoLinkProps } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "./Text";
import { TextStyle, StyleProp, StyleSheet } from "react-native";
import { PARAGRAPH_FONT } from "@/utils/theme";

export interface LinkProps extends ExpoLinkProps {
  disabled?: boolean;
}

export function Link({ style, children, disabled = false, ...rest }: LinkProps) {
  const { colors } = useTheme();

  const linkStyle: StyleProp<TextStyle> = [
    styles.link,
    {
      color: disabled ? colors.accentSecondary : colors.accentPrimary,
    },
    style,
  ];

  return (
    <ExpoLink
      style={linkStyle}
      {...rest}
      {...(disabled && { onPress: undefined })}
      asChild
    >
      <Text>{children}</Text>
    </ExpoLink>
  );
}

const styles = StyleSheet.create({
  link: {
    fontFamily: PARAGRAPH_FONT,
    fontSize: 18,
    fontWeight: 600,
  },
});
