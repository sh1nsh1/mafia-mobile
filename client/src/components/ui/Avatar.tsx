import { useTheme } from "@/hooks/useTheme";
import { Image, ImageSourcePropType, ImageStyle } from "react-native";

export type AvatarProps = {
  size?: number;
  radius?: number;
  src?: ImageSourcePropType;
  style?: ImageStyle;
};

export function Avatar({ size = 40, radius, src, style }: AvatarProps) {
  const resolvedRadius = radius ?? size / 2;
  const { colors } = useTheme();

  return (
    <Image
      source={src ?? require("@/assets/avatar-placeholder.svg")}
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
