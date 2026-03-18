import { useLocalSearchParams, Link } from "expo-router";
import { Users, Shield, Heart, Clock, ChevronLeft } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { api } from "@utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";
import { useRoom } from "@hooks/useRoom";
import Column from "@/components/ui/Column";
import Row from "@/components/ui/Row";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

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

      <Column p="$4" flex={1} gap="$4">
        {/* Host info */}
        <Row items="center" gap="$3">
          <Avatar size="$5" circular>
            <Avatar.Fallback bg="$blue9" />
          </Avatar>
          <Column>
            <Text size="$6" fontWeight="600">
              {"host"}
            </Text>
            <Text size="$4" color="$gray11">
              Хост лобби
            </Text>
          </Column>
        </Row>

        {/* Players */}
        <Column gap={6}>
          <Text>Игроки</Text>
          <Row items="center" gap={6}>
            <Users size={20} />
            <Text>
              {lobby?.participants.length}/{lobby?.maxPlayers}
            </Text>
          </Row>
          <Progress
            value={(lobby?.participants.length! / lobby?.maxPlayers!) * 100}
          />
        </Column>

        <Column gap="$3">
          <Button size="$5" icon={Shield} onPress={joinLobby}>
            Присоединиться к игре
          </Button>
        </Column>

        {/* Game info */}
        <Column gap="$2">
          <Text size="$5" fontWeight="600">
            Информация
          </Text>
          <Row items="center" gap="$2">
            <Clock size={20} />
            <Text>Время раунда: 45 сек</Text>
          </Row>
          <Row items="center" gap="$2">
            <Heart size={20} />
            <Text>Режим: {"rules"}</Text>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
