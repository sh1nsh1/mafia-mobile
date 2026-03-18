import { View as RnView, ViewProps as RnViewProps, ViewStyle } from "react-native";

export type ViewProps = RnViewProps & {
  direction?: ViewStyle["flexDirection"];
  justify?: ViewStyle["justifyContent"];
  items?: ViewStyle["alignItems"];
  gap?: number;
};

export default function View(props: ViewProps) {
  const { children, style, direction, justify, items, gap, ...rest } = props;

  const defaultStyles: ViewStyle = {
    flexDirection: direction,
    justifyContent: justify,
    alignItems: items,
    gap,
  };

  return (
    <RnView style={[defaultStyles, style]} {...rest}>
      {children}
    </RnView>
  );
}
