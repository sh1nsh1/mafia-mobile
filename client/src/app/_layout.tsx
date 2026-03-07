import "../../tamagui.generated.css";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuthStore } from "src/stores/auth";
import SpinnerPage from "src/pages/SpinnerPage";
import { TamaguiProvider, Theme } from "tamagui";
import { config } from "../../tamagui.config";

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

  const { isInitialized, initialize, save } = useAuthStore();

  useEffect(() => {
    initialize().catch(console.error);

    return () => {
      save().catch(console.error);
    };
  }, []);

  const colorScheme = useColorScheme();

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      {isInitialized ? <Slot /> : <SpinnerPage />}
    </TamaguiProvider>
  );
}
