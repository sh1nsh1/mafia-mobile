import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "stores/auth";

export default function AuthPage() {
  const authStore = useAuthStore();

  useEffect(() => {
    (async () => {
      const credentials = await authStore.credentials();

      if (credentials) {
        router.push("/(auth)/logout");
      }
    })();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "flip",
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="logout" />
    </Stack>
  );
}
