import { Pressable, PressableProps, Text } from "react-native";
import React from "react";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  theme?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
} & PressableProps;

export function Button({
  title,
  onPress,
  theme = "primary",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} {...rest}>
      <Text>
        {title} {disabled}
      </Text>
    </Pressable>
  );
}
