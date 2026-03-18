import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";

export default function MainScreen() {
  const authStore = useAuthStore();
  const router = useRouter();

  return (
    <Column items="center" gap={24}>
      <Button>Играть</Button>

      <Button onPress={() => router.push("/settings")}>Настройки</Button>

      <Button
        onPress={async () => {
          await authStore.logOut();
          router.replace("/login");
        }}
      >
        Выйти
      </Button>
    </Column>
  );
}
