import { asyncUserAtom } from "@/atoms/user";
import { SpinnerScreen } from "@/components/SpinnerScreen";
import { useTheme } from "@/hooks/useTheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { FC, PropsWithChildren, Suspense, useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    NozhikBold: require("@/assets/fonts/Nozhik-Bold.otf"),
    IosevkaCharon: require("@/assets/fonts/IosevkaCharon-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Suspense fallback={null}>
        <Theme>
          <Suspense fallback={<SpinnerScreen />}>
            <App />
          </Suspense>
        </Theme>
      </Suspense>
    </SafeAreaProvider>
  );
}

const Theme: FC<PropsWithChildren> = ({ children }) => {
  const { theme, colors } = useTheme();

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar hidden={true} style={theme} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
        {children}
      </SafeAreaView>
    </ThemeProvider>
  );
};

const App: FC = () => {
  const user = useAtomValue(asyncUserAtom);

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
