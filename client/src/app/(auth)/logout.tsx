import { router, useRouter } from "expo-router";
import { useAuthStore } from "src/stores/auth";
import { Button, Text, View, XStack } from "tamagui";

export default function Logout() {
  const authStore = useAuthStore();
  const router = useRouter();

  if (!authStore.isLoggedIn) {
    router.replace("/login");
  }

  function toMain() {
    router.replace("/");
  }

  async function logout() {
    await authStore.logOut();
    router.replace("/login");
  }

  return (
    <View flex={1} gap="$6" justify="center" items="center">
      <Text fontSize="$1">Name: {authStore.user?.name}</Text>

      <Text fontSize="$1">{authStore.credentials?.accessToken}</Text>
      <Text fontSize="$1">{authStore.credentials?.refreshToken}</Text>

      <XStack gap="$4">
        <Button onClick={toMain}>На главную</Button>
        <Button onClick={logout}>Выйти</Button>
      </XStack>
    </View>
  );
}
