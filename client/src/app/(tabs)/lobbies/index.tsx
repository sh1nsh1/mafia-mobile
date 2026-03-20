import { Link, useRouter } from "expo-router";
import Ionicons from "@/components/ui/Ionicons";
import { FlatList, StyleSheet } from "react-native";
import { useEffect } from "react";
import { Lobby } from "@/schemas/lobby";
import Column from "@/components/ui/Column";
import Button from "@/components/ui/Button";
import Row from "@/components/ui/Row";
import Separator from "@/components/ui/Separator";
import Text from "@/components/ui/Text";
import View from "@/components/ui/View";
import { useLobbyStore } from "@/stores/lobby-store";

export default function LobbyListScreen() {
  const router = useRouter();
  const { lobbies, fetchLobbies } = useLobbyStore();

  useEffect(() => {
    if (useLobbyStore.getState().currentLobby !== null) {
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

const LobbyItem = ({ lobby }: { lobby: Lobby }) => (
  <Link href={`/lobbies/${lobby.lobbyId}`} asChild>
    <Row flex={1} items="center" gap={12} style={styles.row}>
      <Column flex={1} gap={3}>
        <Text>{lobby.lobbyId}</Text>
        <Row items="center" gap={6}>
          <Ionicons size={18} name="people" />
          <Text>
            {lobby.participants.length}/{lobby.maxPlayers}
          </Text>
        </Row>
      </Column>

      <Button onPress={() => {}}>Присоединиться</Button>
    </Row>
  </Link>
);

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});
