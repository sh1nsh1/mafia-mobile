import { useAuthStore } from "@/stores/auth-store";
import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import { ThemeToggler } from "@/components/ui/ThemeToggler";
import { useThemeStore } from "@/stores/theme-store";
import Text from "@/components/ui/Text";
import Avatar from "@/components/ui/Avatar";
import Row from "@/components/ui/Row";
import Separator from "@/components/ui/Separator";
import { StyleSheet } from "react-native";

export default function MainScreen() {
  const authStore = useAuthStore();
  const user = useAuthStore(state => state.user);
  const colors = useThemeStore(theme => theme.colors);

  return (
    <>
      <Row
        gap={18}
        style={[styles.row, { backgroundColor: colors.backgroundPrimary }]}
        items="center"
      >
        <Avatar
          src={undefined}
          style={{ borderColor: colors.borderPrimary }}
          size={128}
        />
        <Column flex={1}>
          <Text size={24} weight={600}>
            {user?.name}
          </Text>
          <Text size={24}>Description</Text>
          <Text size={24}>Country: Russia</Text>
        </Column>
        <ThemeToggler />
      </Row>
      <Separator />
      <Column flex={1} justify="center" items="center" gap={24}>
        <Button onPress={() => void authStore.logOut(true)}>Выйти</Button>
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
