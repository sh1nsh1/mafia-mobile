import Text from "@/components/ui/Text";
import { useThemeStore } from "@/stores/theme-store";
import { useAuthStore } from "@/stores/auth-store";
import { StyleSheet } from "react-native";
import Avatar from "./ui/Avatar";
import Column from "./ui/Column";
import Row from "./ui/Row";
import Separator from "./ui/Separator";
import { ThemeToggler } from "./ui/ThemeToggler";

export default function ProfileHeader() {
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
          <Text size={24}>{user?.username}</Text>
          <Text size={24}>Description</Text>
          <Text size={24}>Country: Russia</Text>
        </Column>
        <ThemeToggler />
      </Row>
      <Separator />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
