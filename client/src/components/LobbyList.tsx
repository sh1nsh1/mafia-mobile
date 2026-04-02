import { Lobby, lobbySchema } from "@/schemas/lobby";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import { Button, Column, Ionicons, Row, Separator, Text, View } from "./ui";
import { useSetAtom } from "jotai";
import { asyncRoomMetaAtom } from "@/atoms/room-meta";
import { api } from "@/utils/api";

export function LobbyList({ lobbies }: { lobbies: Lobby[] }) {
  return lobbies.length > 0 ? (
    <FlatList
      style={styles.list}
      data={lobbies}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <LobbyItem lobby={item} />}
      ItemSeparatorComponent={() => <Separator />}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <View justify="center" items="center" style={{ flex: 1 }}>
      <Text align="center" size={18}>
        Лобби нету, но можешь попробовать создать
      </Text>
    </View>
  );
}

function LobbyItem({ lobby }: { lobby: Lobby }) {
  const setRoomMeta = useSetAtom(asyncRoomMetaAtom);
  const router = useRouter();

  const joinLobby = () =>
    api
      .post(`/lobbies/${lobby.id}/join`)
      .then(response => lobbySchema.parseAsync(response.data))
      .then(lobby => setRoomMeta({ roomId: lobby.id, isLobby: true }))
      .catch(console.error);

  return (
    <Row flex={1} items="center" gap={12} style={styles.row}>
      <Column flex={1} gap={3}>
        <Text>{lobby.id}</Text>
        <Text>{"Админ: " + lobby.adminId}</Text>
        <Row items="center" gap={6}>
          <Ionicons size={18} name="people" />
          <Text>
            {lobby.participants.length}/{lobby.maxPlayers}
          </Text>
        </Row>
      </Column>

      <Button onPress={() => router.replace(`/lobbies/${lobby.id}`)}>
        Просмотр
      </Button>
      <Button onPress={joinLobby}>Присоединиться</Button>
    </Row>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    alignSelf: "stretch",
  },
  row: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});
