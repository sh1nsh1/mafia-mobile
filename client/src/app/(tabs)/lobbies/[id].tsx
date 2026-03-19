import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { api } from "@utils/api";
import { lobbySchema } from "@/schemas/lobby";
import Column from "@/components/ui/Column";
import Row from "@/components/ui/Row";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Ionicons from "@/components/ui/Ionicons";
import Text from "@/components/ui/Text";
import Separator from "@/components/ui/Separator";
import { useLobbyStore } from "@/stores/lobby-store";

export default function LobbyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentLobby: lobby, setLobby } = useLobbyStore();

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

  return (
    <Column flex={1} style={{ padding: 10 }} gap={10}>
      {/* Header */}
      <Row items="center" gap={12}>
        <Button
          onPress={() => router.replace("/lobbies")}
          icon={<Ionicons name="chevron-back" size={16} />}
        >
          Обратно
        </Button>
        <Text>{lobby?.lobbyId}</Text>
      </Row>
      <Separator />

      <Column gap={12}>
        {/* Host info */}
        <Row items="center" gap={9}>
          <Avatar size={64} />
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
          <Button
            icon={<Ionicons name="shield" />}
            onPress={() => router.replace("/lobby")}
            pressableStyle={{ alignSelf: "center" }}
          >
            Присоединиться к игре
          </Button>
        </Column>

        {/* Game info */}
        <Column gap={6} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
          <Text>Информация</Text>
          <Row items="center" gap={6}>
            <Ionicons name="time" size={24} />
            <Text>Время раунда: 45 сек</Text>
          </Row>
          <Row items="center" gap={6}>
            <Ionicons name="heart" size={24} />
            <Text>Режим: {"rules"}</Text>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
