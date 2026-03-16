import { Link } from "expo-router";
import { YStack, XStack, SizableText, Button, Separator, H3 } from "tamagui";
import { ChevronRight, Users, Lock } from "@tamagui/lucide-icons";
import { FlatList } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@utils/api";

interface Lobby {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  isPublic: boolean;
  host: string;
  createdAt: string;
}

export default function LobbyListScreen() {
  let [lobbies, setLobbies] = useState<Lobby[]>([]);

  useEffect(() => {
    (async () => {
      let response = await api.get("/lobbies");

      console.log(response.data);

      setLobbies(response.data);
    })();
  }, []);

  return (
    <YStack flex={1} bg="$background" p="$4" gap="$3">
      <H3>Доступные лобби</H3>

      <FlatList
        data={lobbies}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LobbyItem lobby={item} />}
        ItemSeparatorComponent={() => <Separator />}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}

const LobbyItem = ({ lobby }: { lobby: Lobby }) => (
  <Link href={`/lobbies/${lobby.id}`} asChild>
    <XStack p="$4" items="center" gap="$4" bg="$borderColor">
      <YStack flex={1} gap="$1">
        <SizableText size="$6" fontWeight="600">
          {lobby.name}
        </SizableText>
        <XStack items="center" gap="$2">
          <Users size={16} color="$gray10" />
          <SizableText size="$4" color="$gray11">
            {lobby.players}/{lobby.maxPlayers}
          </SizableText>
          <SizableText size="$3" color="$gray10">
            • {lobby.createdAt}
          </SizableText>
        </XStack>
      </YStack>

      <XStack items="center" gap="$2">
        {lobby.isPublic ? (
          <Button size="$3" theme="green" chromeless>
            Присоединиться
          </Button>
        ) : (
          <XStack items="center" gap="$1">
            <Lock size={16} />
            <SizableText size="$3">Пароль</SizableText>
          </XStack>
        )}
        <ChevronRight size={20} color="$gray10" />
      </XStack>
    </XStack>
  </Link>
);
