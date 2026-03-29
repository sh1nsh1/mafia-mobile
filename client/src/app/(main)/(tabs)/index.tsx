import { Avatar, Button, Column, Row, Separator, Text } from "@/components/ui";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/stores/auth-store";
import { StyleSheet } from "react-native";

export default function MainScreen() {
  const { logout } = useAuthStore();
  const { user } = useUser();

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
        <Button onPress={() => logout(true)}>Выйти</Button>
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
