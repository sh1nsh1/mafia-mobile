import { View } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().isLoggedIn) {
      router.replace("/logout");
    }
  }, []);

  return (
    <View flex={1} gap={18} justify="center" items="center">
      <Slot />
    </View>
  );
}
