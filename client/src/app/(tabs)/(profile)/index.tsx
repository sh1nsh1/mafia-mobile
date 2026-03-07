import { useRouter } from "expo-router";
import { useAuthStore } from "src/stores/auth";
import { Button, H2, YStack } from "tamagui";

export default function MainScreen() {
  const authStore = useAuthStore();
  const router = useRouter();

  return (
    <YStack
      flex={1}
      items="center"
      gap="$8"
      px="$10"
      pt="$5"
      background="$background"
    >
      <H2>Профиль здесь</H2>

      <Button>Играть</Button>

      <Button onClick={() => router.push("/settings")}>Настройки</Button>

      <Button
        onClick={async () => {
          await authStore.logOut();
          router.replace("/login");
        }}
      >
        Выйти
      </Button>
    </YStack>
  );
}
