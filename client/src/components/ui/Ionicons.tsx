import { useThemeStore } from "@/stores/theme";
import { Ionicons as IoniconsExpo } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IoniconsPropsExpo = ComponentProps<typeof IoniconsExpo>;
type IoniconsProps = Omit<IoniconsPropsExpo, "color">;

export default function Ionicons(props: IoniconsProps) {
  const colors = useThemeStore(theme => theme.colors);

  return <IoniconsExpo color={colors.textPrimary} {...props} />;
}
