import View from "@/components/ui/View";
import SpinnerPage from "@/pages/SpinnerPage";
import { useAuthStore } from "@/stores/auth-store";
import { useLobbyStore } from "@/stores/lobby-store";
import { useThemeStore } from "@/stores/theme-store";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { init: initLobby } = useLobbyStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if ((fontsLoaded && themeInitilized) || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, themeInitilized, fontsError]);

  useEffect(() => {
    initAuth().catch(console.error);
    initTheme().catch(console.error);
    initLobby().catch(console.error);
  }, []);

  if (!themeInitilized || (!fontsLoaded && !fontsError)) {
    return null;
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme} />
      <View flex={1} style={{ paddingTop: insets.top }}>
        {authInitialized ? <Slot /> : <SpinnerPage />}
      </View>
    </ThemeProvider>
  );
}
