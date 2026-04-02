import { Stack } from "expo-router";

export default function AuthPage() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
