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
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_bottom" }} />
  );
}
