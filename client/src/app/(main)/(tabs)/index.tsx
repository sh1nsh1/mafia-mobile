import { tokensAtom } from "@/atoms/jwt-tokens";
import { userAtom } from "@/atoms/user";
import { Avatar, Button, Column, Row, Separator, Text } from "@/components/ui";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function MainScreen() {
  const user = useAtomValue(userAtom);

  const [tokens, setTokens] = useAtom(tokensAtom);

  useEffect(() => console.log(tokens), [tokens]);

  const logout = () => setTokens(RESET);

  return (
    <>
      <Row gap={18} style={styles.row} items="center">
        <Avatar size={128} />
        <Column flex={1}>
          <Text size={24} weight={600}>
            {user?.name}
          </Text>
          <Text size={24}>Description</Text>
          <Text size={24}>Country: Russia</Text>
        </Column>
      </Row>
      <Separator />
      <Column flex={1} justify="center" items="center" gap={24}>
        <Button onPress={logout}>Выйти</Button>
      </Column>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
