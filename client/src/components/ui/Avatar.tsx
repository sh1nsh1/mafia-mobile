import { useTheme } from "@/hooks/useTheme";
import { Image, ImageStyle } from "react-native";

export type AvatarProps = {
  size?: number;
  radius?: number;
  src?: string;
  style?: ImageStyle;
};

const placeholderImage = require("@/assets/avatar-placeholder.svg");

export function Avatar({ size = 40, radius, src, style }: AvatarProps) {
  const resolvedRadius = radius ?? size / 2;
  const { colors } = useTheme();
  const source = src ? { uri: src } : placeholderImage;

  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          borderRadius: resolvedRadius,
          borderColor: colors.borderPrimary,
          borderWidth: 1,
        },
        style,
      ]}
    />
  );
}
