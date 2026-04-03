import { Lobby, lobbySchema } from "@/schemas/lobby";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import { Button, Column, Ionicons, Row, Separator, Text, View } from "./ui";
import { useSetAtom } from "jotai";
import { asyncRoomMetaAtom } from "@/atoms/room-meta";
import { api } from "@/utils/api";
import { use } from "react";

type LobbyListProps = {
  lobbiesPromise: Promise<Lobby[]>;
};

export function LobbyList({ lobbiesPromise }: LobbyListProps) {
  const lobbies = use(lobbiesPromise);

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

  const lobbyAdminName = lobby.participants.find(p => p.id === lobby.adminId)?.name;
  const otherParticipants = lobby.participants
    .filter(p => p.id !== lobby.adminId)
    .map(p => p.name)
    .join(", ");

  const joinLobby = () =>
    api
      .post(`/lobbies/${lobby.id}/join`)
      .then(response => lobbySchema.parseAsync(response.data))
      .then(lobby => setRoomMeta({ roomId: lobby.id, isLobby: true }))
      .catch(console.error);

  return (
    <Row flex={1} items="center" gap={12} style={styles.row}>
      <Column flex={1} gap={8}>
        <Text weight={600}>{lobby.id}</Text>

        <Column flex={1} gap={3}>
          <Text>{`Админ: ${lobbyAdminName}`}</Text>
          <Text>{`Участники: [${otherParticipants}]`}</Text>
        </Column>

        <Row items="center" gap={6}>
          <Ionicons size={18} name="people" />
          <Text>
            {lobby.participants.length}/{lobby.maxPlayers}
          </Text>
        </Row>
      </Column>

      <Column flex={1} gap={8}>
        <Button onPress={() => router.replace(`/lobbies/${lobby.id}`)}>
          Просмотр
        </Button>
        <Button onPress={joinLobby}>Присоединиться</Button>
      </Column>
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
