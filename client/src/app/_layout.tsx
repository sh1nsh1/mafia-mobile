import { View } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import SpinnerPage from "@/pages/SpinnerPage";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    NozhikBold: require("@/assets/fonts/Nozhik-Bold.otf"),
    IosevkaCharon: require("@/assets/fonts/IosevkaCharon-Medium.ttf"),
  });

  const { isInitialized: authInitialized, initialize: initAuth } = useAuthStore();

  // const [hydrated, setHydrated] = useState(false);
  const { theme } = useTheme();

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  useEffect(() => {
    initAuth().catch(console.error);

    // const unsubscribe = useThemeStore.persist.onFinishHydration(() =>
    //   setHydrated(true),
    // );

    // return () => unsubscribe();
  }, []);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar hidden={true} />
      <View
        flex={1}
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {authInitialized ? <Slot /> : <SpinnerPage />}
      </View>
    </ThemeProvider>
  );
}
