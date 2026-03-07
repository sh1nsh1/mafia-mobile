import "../../tamagui.generated.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Provider } from "src/components/Provider";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuthStore } from "src/stores/auth";
import SpinnerPage from "src/pages/SpinnerPage";

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

  if (!interLoaded && !interError) {
    return null;
  }

  return <Provider>{isInitialized ? <RootLayoutNav /> : <SpinnerPage />}</Provider>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}
