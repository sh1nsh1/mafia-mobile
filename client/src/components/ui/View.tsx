import { useTheme } from "@/hooks/useTheme";
import { View as RnView, ViewProps as RnViewProps, ViewStyle } from "react-native";

export type ViewProps = RnViewProps & {
  flex?: number;
  direction?: ViewStyle["flexDirection"];
  justify?: ViewStyle["justifyContent"];
  items?: ViewStyle["alignItems"];
  gap?: number;
};

export function View(props: ViewProps) {
  const { children, style, flex, direction, justify, items, gap, ...rest } = props;
  const { colors } = useTheme();

  const defaultStyles: ViewStyle = {
    flex,
    flexDirection: direction,
    justifyContent: justify,
    alignItems: items,
    gap,
  };

  return (
    <RnView
      style={[
        defaultStyles,
        {
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderPrimary,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RnView>
  );
}
