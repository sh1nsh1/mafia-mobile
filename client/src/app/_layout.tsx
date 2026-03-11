import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import "../../tamagui.generated.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuthStore } from "src/stores/auth";
import SpinnerPage from "src/pages/SpinnerPage";
import { RootProvider } from "src/components/RootProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  const { isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize().catch(console.error);
  }, []);

  const colorScheme = useColorScheme();

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <RootProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        {isInitialized ? <Slot /> : <SpinnerPage />}
      </ThemeProvider>
    </RootProvider>
  );
}
