import { router } from "expo-router";
import { useAuthStore } from "stores/auth";
import { Button, View, XStack } from "tamagui";

export default function Logout() {
  const authStore = useAuthStore();

  function toMain() {
    router.replace("/(tabs)/main");
  }

  async function logout() {
    await authStore.logout();
    router.replace("/(auth)/login");
  }

  return (
    <View flex={1} gap="$6" justify="center" items="center">
      <XStack>
        <Button onClick={toMain}>На главную</Button>
        <Button onClick={logout}>Выйти</Button>
      </XStack>
    </View>
  );
}
