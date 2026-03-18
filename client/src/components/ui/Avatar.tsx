import { Image, ImageSourcePropType, ImageStyle } from "react-native";

export type AvatarProps = {
  size?: number;
  radius?: number;
  src?: ImageSourcePropType;
  style?: ImageStyle;
};

export default function Avatar({ size = 40, radius, src, style }: AvatarProps) {
  const resolvedRadius = radius ?? size / 2;
  const placeholderImage = require("@/assets/avatar-placeholder.svg");

  return (
    <Image
      source={src ?? placeholderImage}
      style={[
        {
          width: size,
          height: size,
          borderRadius: resolvedRadius,
        },
        style,
      ]}
    />
  );
}
