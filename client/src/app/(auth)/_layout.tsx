import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Slot, useRouter } from "expo-router";
import { useMedia, View } from "tamagui";
import { useAuthStore } from "src/stores/auth";

export default function AuthPage() {
  const authStore = useAuthStore();
  const router = useRouter();

  if (authStore.isLoggedIn) {
    router.replace("/logout");
  }

  return (
    <View flex={1} gap="$6" justify="center" items="center" bg="$background">
      <Slot />
    </View>
  );
}
