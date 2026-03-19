import { useAuthStore } from "@/stores/auth-store";
import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";

export default function MainScreen() {
  const authStore = useAuthStore();

  return (
    <Column flex={1} justify="center" items="center" gap={24}>
      <Button onPress={() => void authStore.logOut(true)}>Выйти</Button>
    </Column>
  );
}
