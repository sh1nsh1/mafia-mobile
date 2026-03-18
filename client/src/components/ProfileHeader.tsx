import { useAuthStore } from "@stores/auth";
import Row from "./ui/Row";
import Avatar from "./ui/Avatar";
import Column from "./ui/Column";
import { ImageStyle, StyleSheet, Text } from "react-native";
import Separator from "./ui/Separator";
import { ThemeToggler } from "./ui/ThemeToggler";
import { useThemeStore } from "@/stores/theme";

export default function ProfileHeader() {
  const user = useAuthStore(state => state.user);
  const colors = useThemeStore(theme => theme.colors);

  const textStyle = [styles.text, { color: colors.textPrimary }];
  const avatarStyle = [
    styles.avatar,
    { borderColor: colors.accentPrimary },
  ] as ImageStyle;

  return (
    <>
      <Row
        gap={18}
        style={[styles.row, { backgroundColor: colors.backgroundPrimary }]}
        items="center"
      >
        <Avatar src={undefined} style={avatarStyle} size={128} />
        <Column>
          <Text style={textStyle}>{user?.username}</Text>
          <Text style={textStyle}>Description</Text>
          <Text style={textStyle}>Country: Russia</Text>
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
  avatar: {
    borderWidth: 1,
  },
  text: {
    fontFamily: "IosevkaCharon",
    fontSize: 24,
  },
});
