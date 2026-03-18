import { Link } from "expo-router";
import { ChevronRight, Users, Lock } from "@tamagui/lucide-icons";
import { FlatList, Text } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";
import Column from "@/components/ui/Column";
import Button from "@/components/ui/Button";
import Row from "@/components/ui/Row";
import Separator from "@/components/ui/Separator";

export default function LobbyListScreen() {
  let [lobbies, setLobbies] = useState<Lobby[]>([]);

  const fetchData = async () => {
    let response = await api.get("/lobbies").catch(console.error);

    if (response) {
      const lobbies: Lobby[] = (response.data as object[])
        .map(o => lobbySchema.safeParse(o))
        .filter(r => {
          if (r.success) {
            return true;
          } else {
            console.log(r.error);
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
    <Column gap={9}>
      <Text>Доступные лобби</Text>

      <FlatList
        data={lobbies}
        keyExtractor={item => item.lobbyId}
        renderItem={({ item }) => <LobbyItem lobby={item} />}
        ItemSeparatorComponent={() => <Separator />}
        showsVerticalScrollIndicator={false}
      />

      <Button onPress={() => void fetchData()}>Обновить</Button>
    </Column>
  );
}

const LobbyItem = ({ lobby }: { lobby: Lobby }) => (
  <Link href={`/lobbies/${lobby.lobbyId}`} asChild>
    <Row items="center" gap={12}>
      <Column gap={3}>
        <Text>{lobby.lobbyId}</Text>
        <Row items="center" gap={6}>
          <Users size={16} color="$gray10" />
          <Text>
            {lobby.participants.length}/{lobby.maxPlayers}
          </Text>
          <Text>• {"created at"}</Text>
        </Row>
      </Column>

      <Row items="center" gap={6}>
        <Button>Присоединиться</Button>
        <ChevronRight size={20} color="$gray10" />
      </Row>
    </Row>
  </Link>
);
