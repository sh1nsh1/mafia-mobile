import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";
import {
  Column,
  Row,
  Button,
  Avatar,
  Ionicons,
  Text,
  Separator,
} from "@/components/ui";
import { useLobbyStore } from "@/stores/lobby-store";

export default function LobbyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { joinLobby } = useLobbyStore();
  const [lobby, setLobby] = useState<Lobby | null>(null);

  useEffect(() => {
    (async () => {
      const response = await api.get(`/lobbies/${id}`).catch(console.error);

      if (response) {
        const result = lobbySchema.safeParse(response.data);

        if (result.success) {
          console.log(result.data);
          setLobby(result.data);
        } else {
          console.error(result.error);
        }
      }
    })();
  }, []);

  return (
    <Column flex={1} style={{ padding: 10 }} gap={10}>
      <Row items="center" gap={12}>
        <Button
          onPress={() => router.replace("/lobbies")}
          icon={<Ionicons name="chevron-back" size={16} />}
        >
          Обратно
        </Button>
        <Text>{lobby?.id}</Text>
      </Row>
      <Separator />

      <Column gap={12}>
        <Row items="center" gap={9}>
          <Avatar size={64} />
          <Column>
            <Text>{"Хост: " + lobby?.adminId}</Text>
          </Column>
        </Row>

        <Column gap={6}>
          <Text>Игроки</Text>
          <Text>{lobby?.participants.map(p => p.name).join(", ")}</Text>
          <Row items="center" gap={6}>
            <Ionicons name="people" />
            <Text>
              {lobby?.participants.length}/{lobby?.maxPlayers}
            </Text>
          </Row>
        </Column>

        <Column gap={9}>
          <Button
            icon={<Ionicons name="enter" />}
            onPress={() => {
              if (lobby) {
                joinLobby(lobby.id);
                router.replace("/lobby");
              }
            }}
            pressableStyle={{ alignSelf: "center" }}
          >
            Присоединиться к игре
          </Button>
        </Column>
      </Column>
    </Column>
  );
}
