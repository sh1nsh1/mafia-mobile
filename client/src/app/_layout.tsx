import { Spinner, View } from "@/components/ui";
import { useHydration } from "@/hooks/useHydration";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    NozhikBold: require("@/assets/fonts/Nozhik-Bold.otf"),
    IosevkaCharon: require("@/assets/fonts/IosevkaCharon-Medium.ttf"),
  });
  const { isInitialized: authInitialized, initialize: initAuth } = useAuthStore();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const isThemeHydrated = useHydration(useThemeStore);

  useEffect(() => {
    initAuth().catch(console.error);
  }, []);

  const isReady = useMemo(
    () => isThemeHydrated && (fontsLoaded || fontsError),
    [isThemeHydrated, fontsLoaded, fontsError],
  );

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar hidden={true} style={theme} />
      <View
        flex={1}
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {authInitialized ? (
          <Slot />
        ) : (
          <View flex={1} justify="center" items="center">
            <Spinner size="large" />
          </View>
        )}
      </View>
    </ThemeProvider>
  );
}
