import { useTheme } from "@/hooks/useTheme";
import {
  StyleSheet,
  Switch as RnSwitch,
  SwitchProps as RnSwitchProps,
} from "react-native";

export type SwitchProps = RnSwitchProps & {
  size?: number;
};

export function Switch(props: SwitchProps) {
  const { style, size = 20, ...restProps } = props;
  const { colors } = useTheme();

  const switchStyle = [
    styles.switch,
    {
      width: size * 2,
      height: size,
      borderRadius: size / 2,
    },
    style,
  ];

  return (
    <RnSwitch
      style={switchStyle}
      trackColor={{
        false: colors.borderPrimary,
        true: colors.borderPrimary,
      }}
      thumbColor={colors.accentPrimary}
      ios_backgroundColor={colors.backgroundSecondary}
      {...restProps}
    />
  );
}

const styles = StyleSheet.create({
  switch: {
    transform: [{ scale: 0.9 }],
  },
});
