import { Link } from "expo-router";
import Ionicons from "@/components/ui/Ionicons";
import { FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";
import Column from "@/components/ui/Column";
import Button from "@/components/ui/Button";
import Row from "@/components/ui/Row";
import Separator from "@/components/ui/Separator";
import Text from "@/components/ui/Text";
import View from "@/components/ui/View";

export default function LobbyListScreen() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  const fetchData = async () => {
    const response = await api.get("/lobbies").catch(console.error);

    if (response) {
      const lobbies: Lobby[] = (response.data as object[])
        .map(o => lobbySchema.safeParse(o))
        .filter(result => {
          if (result.success) {
            return true;
          } else {
            console.log(result.error);
            return false;
          }
        })
        .map(r => r.data!);

      console.log(lobbies);

      setLobbies(lobbies);
    }
  };

  useEffect(() => void fetchData(), []);

  return (
    <Column gap={9} style={{ padding: 12, flex: 1 }}>
      <Text size={64} align="center" header style={{ letterSpacing: 3 }}>
        Доступные лобби
      </Text>

      {lobbies.length > 0 ? (
        <FlatList
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

      <Button
        onPress={() => void fetchData()}
        pressableStyle={{ alignSelf: "center" }}
      >
        Обновить
      </Button>
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

      <Button>Присоединиться</Button>
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
