import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "src/stores/auth";

export default function AuthPage() {
  const authStore = useAuthStore();

  useEffect(() => {
    (async () => {
      const credentials = await authStore.credentials();
      router.push("/main");
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
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
