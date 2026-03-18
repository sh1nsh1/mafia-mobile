import SpinnerPage from "@/pages/SpinnerPage";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    NozhikBold: require("@/assets/fonts/Nozhik-Bold.otf"),
    IosevkaCharon: require("@/assets/fonts/IosevkaCharon-Medium.ttf"),
  });
  const { isInitialized: authInitialized, initialize: initAuth } = useAuthStore();
  const {
    theme,
    isInitialized: themeInitilized,
    initialize: initTheme,
  } = useThemeStore();

  useEffect(() => {
    if ((fontsLoaded && themeInitilized) || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, themeInitilized, fontsError]);

  useEffect(() => {
    initAuth().catch(console.error);
    initTheme().catch(console.error);
  }, []);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {authInitialized ? <Slot /> : <SpinnerPage />}
    </ThemeProvider>
  );
}
