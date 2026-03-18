import View, { ViewProps } from "@components/ui/View";

export type ColumnProps = Omit<ViewProps, "direction">;

export default function Column(props: ColumnProps) {
  const { children, style, ...rest } = props;

  return (
    <View direction="column" style={style} {...rest}>
      {children}
    </View>
  );
}
