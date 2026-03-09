import { Link } from "expo-router";
import { YStack, XStack, SizableText, Button, Separator, Avatar } from "tamagui";
import { ChevronRight, Users, Lock } from "@tamagui/lucide-icons";
import { FlatList } from "react-native";

interface Lobby {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  isPublic: boolean;
  host: string;
  createdAt: string;
}

const ADJECTIVES = [
  "angry",
  "brave",
  "crazy",
  "drunk",
  "evil",
  "fierce",
  "grumpy",
  "hungry",
  "insane",
  "killer",
  "lucky",
  "mad",
  "naive",
  "obnoxious",
];

const MAFIA_NAMES = [
  "euclid",
  "fermat",
  "gauss",
  "hilbert",
  "knuth",
  "lovelace",
  "minsky",
  "turing",
  "ritchie",
  "thompson",
  "stallman",
  "torvalds",
];

let count = 1;

function randomLobby() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const name = MAFIA_NAMES[Math.floor(Math.random() * MAFIA_NAMES.length)];

  const maxPlayers = Math.round(Math.random() * 24);
  const players = 1 + Math.round(Math.random() * maxPlayers - 1);

  return {
    id: (count++).toString(),
    name: `${adj}_${name}`,
    players,
    maxPlayers,
    isPublic: Math.random() > 0.5 ? true : false,
    host: "Матвей",
    createdAt: `${Math.round(Math.random() * 60)} мин назад`,
  };
}

const lobbies: Lobby[] = Array.from({ length: 100 }, () => randomLobby());

export default function LobbyListScreen() {
  return (
    <YStack flex={1} bg="$background" p="$4" gap="$3">
      <SizableText size="$8" fontWeight="bold" mb="$2">
        Доступные лобби
      </SizableText>

      <FlatList
        data={lobbies}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LobbyItem lobby={item} />}
        ItemSeparatorComponent={() => <Separator />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
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
