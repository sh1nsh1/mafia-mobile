import { View, ViewProps } from "./View";

export type ColumnProps = Omit<ViewProps, "direction">;

export function Column(props: ColumnProps) {
  const { children, style, ...rest } = props;

  return (
    <View direction="column" style={style} {...rest}>
      {children}
    </View>
  );
}
