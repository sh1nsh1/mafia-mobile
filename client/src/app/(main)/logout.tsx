import { Row, Text, Button, View } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Logout() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, []);

  return (
    <View flex={1} gap={18} justify="center" items="center">
      <Text size={20}>
        Вы уже зашли за{" "}
        <Text size={22} weight={600}>
          {user?.name}
        </Text>
      </Text>

      <Row gap={12}>
        <Button onPress={() => router.replace("/(main)/(tabs)")}>На главную</Button>
        <Button onPress={() => logout(true)}>Выйти</Button>
      </Row>
    </View>
  );
}
