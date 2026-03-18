import Button from "@components/ui/Button";
import { Redirect, useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import Text from "@/components/ui/Text";
import Row from "@/components/ui/Row";

export default function Logout() {
  const authStore = useAuthStore();
  const router = useRouter();

  if (!authStore.isLoggedIn) {
    <Redirect href="/login" />;
  }

  return (
    <>
      <Text size={20}>
        Вы уже зашли за{" "}
        <Text size={22} weight={600}>
          {authStore.user!.username}
        </Text>
      </Text>

      <Row gap={12}>
        <Button onPress={() => router.replace("/")}>На главную</Button>
        <Button onPress={async () => await authStore.logOut(true)}>Выйти</Button>
      </Row>
    </>
  );
}
