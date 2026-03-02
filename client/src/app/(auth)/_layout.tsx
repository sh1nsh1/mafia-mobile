import { Stack } from "expo-router";

export default function AuthPage() {
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
