import React from "react";
import { useLocalSearchParams, Link } from "expo-router";
import {
  YStack,
  XStack,
  SizableText,
  Button,
  Input,
  Avatar,
  Progress,
} from "tamagui";
import { Users, Shield, Heart, Clock, ChevronLeft } from "@tamagui/lucide-icons";

export default function LobbyDetailScreen() {
  const { id } = useLocalSearchParams();

  const lobby = {
    id: id as string,
    name: "Матвеев лобби",
    players: 5,
    maxPlayers: 10,
    host: "Матвей",
    roles: ["Мафия", "Шериф", "Доктор"],
    rules: "Классические правила",
    status: "waiting" as "waiting" | "started" | "finished",
  };

  const [password, setPassword] = React.useState("");

  const joinLobby = () => {
    // Логика присоединения
    console.log("Присоединиться к лобби:", lobby.id);
  };

  return (
    <YStack flex={1} bg="$background">
      {/* Header */}
      <XStack p="$4" items="center" gap="$4">
        <Link href="/lobbies" asChild>
          <Button size="$3" chromeless icon={ChevronLeft} />
        </Link>
        <SizableText flex={1} size="$7" fontWeight="bold">
          {lobby.name}
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
              {lobby.host}
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
              {lobby.players}/{lobby.maxPlayers}
            </SizableText>
          </XStack>
          <Progress value={(lobby.players / lobby.maxPlayers) * 100} />
        </YStack>

        {/* Join form */}
        {lobby.status === "waiting" && (
          <YStack gap="$3">
            <Button size="$5" icon={Shield} onPress={joinLobby}>
              Присоединиться к игре
            </Button>
            {!false && (
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                secureTextEntry
              />
            )}
          </YStack>
        )}

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
            <SizableText>Режим: {lobby.rules}</SizableText>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
