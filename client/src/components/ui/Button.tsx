import { ReactNode } from "react";
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
} from "react-native";
import Row from "./Row";
import Text from "./Text";
import { useThemeStore } from "@/stores/theme";

interface ButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  size?: number;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function Button(props: ButtonProps) {
  const { children, icon, size = 18, ...rest } = props;
  const colors = useThemeStore(theme => theme.colors);
  const pressableStyle: PressableProps["style"] = [
    styles.pressable,
    {
      borderColor: colors.borderPrimary,
      backgroundColor: colors.backgroundSecondary,
    },
  ];

  return (
    <Pressable style={pressableStyle} {...rest}>
      <Row items="center" justify="center" gap={3}>
        {icon}
        <Text size={size} style={{ backgroundColor: colors.backgroundSecondary }}>
          {children}
        </Text>
      </Row>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
