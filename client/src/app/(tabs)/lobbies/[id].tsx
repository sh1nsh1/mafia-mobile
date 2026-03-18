import { useLocalSearchParams, Link } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { api } from "@utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";
import { useRoom } from "@hooks/useRoom";
import Column from "@/components/ui/Column";
import Row from "@/components/ui/Row";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/ui/Avatar";

export default function LobbyDetailScreen() {
  const { id } = useLocalSearchParams();
  const room = useRoom(id as string);

  let [lobby, setLobby] = useState<Lobby | null>(null);

  useEffect(() => {
    (async () => {
      const response = await api.get(`/lobbies/${id}`).catch(console.error);

      if (response) {
        const result = lobbySchema.safeParse(response.data);

        if (result.success) {
          console.log(result.data);
          setLobby(response.data);
        } else {
          console.error(result.error);
        }
      }
    })();
  }, []);

  const joinLobby = () => {
    room.connect()?.subscribe(e => console.log(e));
  };

  return (
    <Column>
      {/* Header */}
      <Row items="center" gap={12}>
        <Link href="/lobbies" asChild>
          <Button icon={<Ionicons name="chevron-back" />} />
        </Link>
        <Text>{lobby?.lobbyId}</Text>
      </Row>

      <Column gap={12}>
        {/* Host info */}
        <Row items="center" gap={9}>
          <Avatar />
          <Column>
            <Text>{"host"}</Text>
            <Text>Хост лобби</Text>
          </Column>
        </Row>

        {/* Players */}
        <Column gap={6}>
          <Text>Игроки</Text>
          <Row items="center" gap={6}>
            <Ionicons name="people" />
            <Text>
              {lobby?.participants.length}/{lobby?.maxPlayers}
            </Text>
          </Row>
          <Text>
            {"Progresss: " +
              (lobby?.participants.length! / lobby?.maxPlayers!) * 100}
          </Text>
        </Column>

        <Column gap={9}>
          <Button icon={<Ionicons name="shield" />} onPress={joinLobby}>
            Присоединиться к игре
          </Button>
        </Column>

        {/* Game info */}
        <Column gap={6}>
          <Text>Информация</Text>
          <Row items="center">
            <Ionicons name="time" />
            <Text>Время раунда: 45 сек</Text>
          </Row>
          <Row items="center">
            <Ionicons name="heart" />
            <Text>Режим: {"rules"}</Text>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
