import { router } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "stores/auth";
import { Spinner, YStack } from "tamagui";

export default function Index() {
  const authStore = useAuthStore();

  useEffect(() => {
    (async () => {
      const path = (await authStore.credentials()) ? "/main" : "/login";
      router.push(path);
    })();
  }, []);

  return (
    <YStack items="center" justify="center">
      <Spinner size="large" color="$yellow10" />
    </YStack>
  );
}
