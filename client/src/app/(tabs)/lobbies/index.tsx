import {
  Button,
  Column,
  Ionicons,
  Row,
  Separator,
  Text,
  View,
} from "@/components/ui";
import { Lobby } from "@/schemas/lobby";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";

export default function LobbyListScreen() {
  const router = useRouter();
  const { lobbies, fetchLobbies, currentLobby } = useLobbyStore();

  useEffect(() => {
    if (currentLobby !== null) {
      router.replace("/lobby");
    } else {
      fetchLobbies();
    }
  }, []);

  return (
    <Column flex={1} justify="center" items="center" gap={9} style={{ padding: 12 }}>
      <Text size={64} align="center" header style={{ letterSpacing: 3 }}>
        Доступные лобби
      </Text>

      {lobbies.length > 0 ? (
        <FlatList
          style={{ flex: 1, alignSelf: "stretch" }}
          data={lobbies}
          keyExtractor={item => item.lobbyId}
          renderItem={({ item }) => <LobbyItem lobby={item} />}
          ItemSeparatorComponent={() => <Separator />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View justify="center" items="center" style={{ flex: 1 }}>
          <Text align="center" size={18}>
            Лобби нету, но можешь попробовать создать одно
          </Text>
        </View>
      )}

      <Row gap={12}>
        <Button
          onPress={() => void fetchLobbies()}
          pressableStyle={{ alignSelf: "center" }}
        >
          Обновить
        </Button>
        <Button
          onPress={() => router.push("/lobbies/new")}
          pressableStyle={{ alignSelf: "center" }}
        >
          Создать
        </Button>
      </Row>
    </Column>
  );
}

const LobbyItem = ({ lobby }: { lobby: Lobby }) => {
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
};

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});
