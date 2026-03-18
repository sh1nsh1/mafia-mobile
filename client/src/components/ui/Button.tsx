import { ReactNode } from "react";
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  TextProps,
} from "react-native";
import Row from "./Row";
import Text from "./Text";
import { useThemeStore } from "@/stores/theme";

interface ButtonProps {
  children?: ReactNode;
  pressableStyle?: PressableProps["style"];
  textStyle?: TextProps["style"];
  icon?: ReactNode;
  size?: number;
  disabled?: boolean;
  onPress?: PressableProps["onPress"];
}

export default function Button(props: ButtonProps) {
  const { children, pressableStyle, textStyle, icon, size = 18, ...rest } = props;
  const colors = useThemeStore(theme => theme.colors);

  return (
    <Pressable
      style={[
        styles.pressable,
        {
          borderColor: colors.borderPrimary,
          backgroundColor: colors.backgroundSecondary,
          ...pressableStyle,
        },
      ]}
      {...rest}
    >
      <Row
        items="center"
        justify="center"
        gap={size / 3}
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        {icon}
        <Text
          align="center"
          size={size}
          style={[
            {
              color: colors.textPrimary,
              backgroundColor: colors.backgroundSecondary,
              ...textStyle,
            },
          ]}
          selectable={false}
        >
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
