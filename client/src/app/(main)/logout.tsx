import { tokensAtom } from "@/atoms/jwt-tokens";
import { store } from "@/atoms/store";
import { userAtom } from "@/atoms/user";
import { Row, Text, Button, View } from "@/components/ui";
import { useRouter } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";

export default function Logout() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const [, setTokens] = useAtom(tokensAtom);

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
        <Button onPress={() => setTokens(RESET)}>Выйти</Button>
      </Row>
    </View>
  );
}
