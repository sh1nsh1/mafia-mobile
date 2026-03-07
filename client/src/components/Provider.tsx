import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { config } from "../../tamagui.config";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function Provider({ children }: Props) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      {children}
    </TamaguiProvider>
  );
}
