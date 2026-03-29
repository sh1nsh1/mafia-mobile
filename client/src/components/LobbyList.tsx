import { Lobby } from "@/schemas/lobby";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import { Button, Column, Ionicons, Row, Separator, Text, View } from "./ui";

export function LobbyList({ lobbies }: { lobbies: Lobby[] }) {
  return lobbies.length > 0 ? (
    <FlatList
      style={styles.list}
      data={lobbies}
      keyExtractor={item => item.lobbyId}
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
  const { joinLobby } = useLobbyStore();
  const router = useRouter();

  return (
    <Row flex={1} items="center" gap={12} style={styles.row}>
      <Column flex={1} gap={3}>
        <Text>{lobby.lobbyId}</Text>
        <Text>{"Админ: " + lobby.adminId}</Text>
        <Row items="center" gap={6}>
          <Ionicons size={18} name="people" />
          <Text>
            {lobby.participants.length}/{lobby.maxPlayers}
          </Text>
        </Row>
      </Column>

      <Button onPress={() => router.replace(`/lobbies/${lobby.lobbyId}`)}>
        Просмотр
      </Button>
      <Button
        onPress={() => joinLobby(lobby.lobbyId).then(() => router.replace("/lobby"))}
      >
        Присоединиться
      </Button>
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
