import { useRouter } from "expo-router";
import { useAuthStore } from "src/stores/auth";
import { Button, Text, XStack } from "tamagui";

export default function Logout() {
  const authStore = useAuthStore();
  const router = useRouter();

  if (!authStore.isLoggedIn) {
    router.replace("/login");
  }

  return (
    <>
      <Text fontSize="$1">Name: {"username here"}</Text>

      <Text fontSize="$1">{authStore.credentials?.accessToken}</Text>
      <Text fontSize="$1">{authStore.credentials?.refreshToken}</Text>

      <XStack gap="$4">
        <Button onClick={() => router.replace("/")}>На главную</Button>
        <Button onClick={async () => await authStore.logOut(true)}>Выйти</Button>
      </XStack>
    </>
  );
}
