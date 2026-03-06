import { router } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "src/stores/auth";
import { Spinner, YStack } from "tamagui";

export default function Index() {
  const authStore = useAuthStore();

  useEffect(() => {
    (async () => {
      const path = (await authStore.credentials()) ? "/(tabs)" : "/(auth)";
      router.push(path);
    })();
  }, []);

  return (
    <YStack items="center" justify="center">
      <Spinner size="large" color="$yellow10" />
    </YStack>
  );
}
