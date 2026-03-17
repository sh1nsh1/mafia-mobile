import { Link } from "expo-router";
import { YStack, XStack, SizableText, Button, Separator, H3 } from "tamagui";
import { ChevronRight, Users, Lock } from "@tamagui/lucide-icons";
import { FlatList } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@utils/api";
import { Lobby, lobbySchema } from "src/schemas/lobby";

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
    <YStack flex={1} bg="$background" p="$4" gap="$3">
      <H3>Доступные лобби</H3>

      <FlatList
        data={lobbies}
        keyExtractor={item => item.lobbyId}
        renderItem={({ item }) => <LobbyItem lobby={item} />}
        ItemSeparatorComponent={() => <Separator />}
        showsVerticalScrollIndicator={false}
      />

      <Button onPress={() => void fetchData()}>Обновить</Button>
    </YStack>
  );
}

const LobbyItem = ({ lobby }: { lobby: Lobby }) => (
  <Link href={`/lobbies/${lobby.lobbyId}`} asChild>
    <XStack p="$4" items="center" gap="$4" bg="$borderColor">
      <YStack flex={1} gap="$1">
        <SizableText size="$6" fontWeight="600">
          {lobby.lobbyId}
        </SizableText>
        <XStack items="center" gap="$2">
          <Users size={16} color="$gray10" />
          <SizableText size="$4" color="$gray11">
            {lobby.participants.length}/{lobby.maxPlayers}
          </SizableText>
          <SizableText size="$3" color="$gray10">
            • {"created at"}
          </SizableText>
        </XStack>
      </YStack>

      <XStack items="center" gap="$2">
        <Button size="$3" theme="green" chromeless>
          Присоединиться
        </Button>
        <ChevronRight size={20} color="$gray10" />
      </XStack>
    </XStack>
  </Link>
);
