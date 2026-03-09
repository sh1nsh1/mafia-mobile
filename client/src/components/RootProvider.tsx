import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Platform, useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { CurrentToast } from "./CurrentToast";
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
      <ToastProvider swipeDirection="horizontal" duration={2000}>
        {children}
        <CurrentToast />
        {Platform.OS === "web" ? (
          <ToastViewport flexDirection="column" top={50} left={0} right={0} />
        ) : (
          <ToastViewport
            top={80}
            left={-60}
            minWidth="100%"
            alignItems="center"
            items="center"
            justify="center"
            justifyContent="center"
            flexDirection="column"
          />
        )}
      </ToastProvider>
    </TamaguiProvider>
  );
}
