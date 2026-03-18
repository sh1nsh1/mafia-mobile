import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { ReactNode } from "react";
import { config } from "../../tamagui.config";

type Props = { children: ReactNode };

export function RootProvider({ children }: Props) {
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
