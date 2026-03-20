import { useThemeStore } from "@/stores/theme-store";
import { StyleSheet, Switch, SwitchProps } from "react-native";

type SwitchPropsCustom = SwitchProps & {
  size?: number;
};

export default function CustomSwitch(props: SwitchPropsCustom) {
  const { style, size = 20, ...restProps } = props;
  const colors = useThemeStore(theme => theme.colors);

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
    <Switch
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
