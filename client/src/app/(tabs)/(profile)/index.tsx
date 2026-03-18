import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import { StyleSheet } from "react-native";

export default function MainScreen() {
  const authStore = useAuthStore();
  const router = useRouter();

  return (
    <Column justify="center" items="center" gap={24} style={styles.column}>
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

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
});
