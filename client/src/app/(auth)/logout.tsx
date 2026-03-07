import { router } from "expo-router";
import { useAuthStore } from "src/stores/auth";
import { Button, View, XStack } from "tamagui";

export default function Logout() {
  const authStore = useAuthStore();

  function toMain() {
    router.replace("/");
  }

  async function logout() {
    await authStore.logOut();
    router.replace("/login");
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
