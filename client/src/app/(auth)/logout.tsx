import Row from "@/components/ui/Row";
import Text from "@/components/ui/Text";
import { useAuthStore } from "@/stores/auth-store";
import Button from "@components/ui/Button";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Logout() {
  const { user, isLoggedIn, logOut } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, []);

  return (
    <>
      <Text size={20}>
        Вы уже зашли за{" "}
        <Text size={22} weight={600}>
          {user?.username}
        </Text>
      </Text>

      <Row gap={12}>
        <Button onPress={() => router.replace("/")}>На главную</Button>
        <Button onPress={() => logOut(true)}>Выйти</Button>
      </Row>
    </>
  );
}
