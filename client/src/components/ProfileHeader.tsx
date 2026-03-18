import { useAuthStore } from "@stores/auth";
import Row from "./ui/Row";
import Avatar from "./ui/Avatar";
import Column from "./ui/Column";
import { pallete } from "@utils/palette";
import { Text } from "react-native";

export default function ProfileHeader() {
  const user = useAuthStore(state => state.user);

  return (
    <>
      <Row gap={18} style={{ backgroundColor: pallete.darkred }}>
        <Avatar src={undefined} />
        <Column>
          <Text>{user?.username}</Text>
          <Text>Description</Text>
          <Text>Country: Russia</Text>
        </Column>
      </Row>
    </>
  );
}
