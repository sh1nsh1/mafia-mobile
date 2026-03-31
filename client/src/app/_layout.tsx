import { userAtom } from "@/atoms/user";
import { Spinner, View } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/auth-store";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
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

  const isReady = fontsLoaded || fontsError;

  const user = useAtomValue(userAtom);

  useEffect(() => {
    initAuth().catch(console.error);
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
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={user === undefined}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={user !== undefined}>
              <Stack.Screen name="(main)" />
            </Stack.Protected>
          </Stack>
        ) : (
          <View flex={1} justify="center" items="center">
            <Spinner size="large" />
          </View>
        )}
      </View>
    </ThemeProvider>
  );
}
