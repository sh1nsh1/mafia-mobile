import { useTheme } from "@/hooks/useTheme";
import { Ionicons as IoniconsExpo } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IoniconsPropsExpo = ComponentProps<typeof IoniconsExpo>;
type IoniconsProps = Omit<IoniconsPropsExpo, "color">;

export function Ionicons(props: IoniconsProps) {
  const { colors } = useTheme();

  return <IoniconsExpo color={colors.textPrimary} {...props} />;
}
