import { useLocalSearchParams, Link } from "expo-router";
import { YStack, XStack, SizableText, Button, Avatar, Progress } from "tamagui";
import { Users, Shield, Heart, Clock, ChevronLeft } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { api } from "@utils/api";
import { Lobby, lobbySchema } from "src/schemas/lobby";
import { useRoom } from "@hooks/useRoom";

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
    room.connect().subscribe(e => console.log(e));
  };

  return (
    <YStack flex={1} bg="$background">
      {/* Header */}
      <XStack p="$4" items="center" gap="$4">
        <Link href="/lobbies" asChild>
          <Button size="$3" chromeless icon={ChevronLeft} />
        </Link>
        <SizableText flex={1} size="$7" fontWeight="bold">
          {lobby?.lobbyId}
        </SizableText>
      </XStack>

      <YStack p="$4" flex={1} gap="$4">
        {/* Host info */}
        <XStack items="center" gap="$3">
          <Avatar size="$5" circular>
            <Avatar.Fallback bg="$blue9" />
          </Avatar>
          <YStack>
            <SizableText size="$6" fontWeight="600">
              {"host"}
            </SizableText>
            <SizableText size="$4" color="$gray11">
              Хост лобби
            </SizableText>
          </YStack>
        </XStack>

        {/* Players */}
        <YStack gap="$2">
          <SizableText size="$5" fontWeight="600">
            Игроки
          </SizableText>
          <XStack items="center" gap="$2">
            <Users size={20} />
            <SizableText size="$6">
              {lobby?.participants.length}/{lobby?.maxPlayers}
            </SizableText>
          </XStack>
          <Progress
            value={(lobby?.participants.length! / lobby?.maxPlayers!) * 100}
          />
        </YStack>

        <YStack gap="$3">
          <Button size="$5" icon={Shield} onPress={joinLobby}>
            Присоединиться к игре
          </Button>
        </YStack>

        {/* Game info */}
        <YStack gap="$2">
          <SizableText size="$5" fontWeight="600">
            Информация
          </SizableText>
          <XStack items="center" gap="$2">
            <Clock size={20} />
            <SizableText>Время раунда: 45 сек</SizableText>
          </XStack>
          <XStack items="center" gap="$2">
            <Heart size={20} />
            <SizableText>Режим: {"rules"}</SizableText>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
