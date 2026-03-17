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
  const [loaded, error] = useFonts({
    NozhikBold: require("assets/fonts/Nozhik-Bold.otf"),
    IosevkaCharon: require("assets/fonts/IosevkaCharon-Medium.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const { isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize().catch(console.error);
  }, []);

  const colorScheme = useColorScheme();

  if (!loaded && !error) {
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
