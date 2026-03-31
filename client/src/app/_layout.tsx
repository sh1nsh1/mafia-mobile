import { tokensAtom } from "@/atoms/jwt-tokens";
import { userAtom } from "@/atoms/user";
import { Spinner, View } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { FC, Suspense, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    NozhikBold: require("@/assets/fonts/Nozhik-Bold.otf"),
    IosevkaCharon: require("@/assets/fonts/IosevkaCharon-Medium.ttf"),
  });

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar hidden={true} style={theme} />
      <View
        flex={1}
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Suspense
          fallback={
            <View flex={1} justify="center" items="center">
              <Spinner size="large" />
            </View>
          }
        >
          <App />
        </Suspense>
      </View>
    </ThemeProvider>
  );
}

const App: FC = () => {
  const user = useAtomValue(userAtom);
  const tokens = useAtomValue(tokensAtom);

  useEffect(() => console.log("Tokens: ", tokens), [tokens]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={user === undefined}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={user !== undefined}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
};
