import { View } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().user) {
      router.replace("/logout");
    }
  }, []);

  return (
    <View flex={1} gap={18} justify="center" items="center">
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
