import { View, ViewProps } from "./View";

export type RowProps = Omit<ViewProps, "direction">;

export function Row(props: RowProps) {
  const { children, style, ...rest } = props;

  return (
    <View direction="row" style={style} {...rest}>
      {children}
    </View>
  );
}
