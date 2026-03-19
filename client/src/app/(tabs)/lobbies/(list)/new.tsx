import { api } from "@utils/api";
import { useCallback, useState } from "react";
import Slider from "@react-native-community/slider";
import Button from "@components/ui/Button";
import Column from "@components/ui/Column";
import Text from "@/components/ui/Text";
import { useRouter } from "expo-router";
import { lobbySchema } from "@/schemas/lobby";
import { useLobbyStore } from "@/stores/lobby-store";

export default function CreateGameScreen() {
  const [maxPlayers, setMaxPlayers] = useState(7);
  const router = useRouter();
  const { currentLobby, setLobby } = useLobbyStore();

  const createLobby = useCallback(
    async (maxPlayers: number) => {
      try {
        console.log("Пытаюсь создать лобби");
        const response = await api.post(
          "/lobbies",
          { maxPlayers },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const result = await lobbySchema.safeParseAsync(response.data);

        if (result.success) {
          const lobby = result.data;
          setLobby(lobby);
        }
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
      }
    },
    [setLobby],
  );

  const onPress = () => {
    createLobby(maxPlayers).then(
      () => currentLobby && router.replace("/lobbies/current"),
    );
  };

  return (
    <Column
      gap={18}
      items="center"
      justify="center"
      style={{ padding: 12, flex: 1 }}
    >
      <Text size={64} style={{ letterSpacing: 3 }} header>
        Создай лобби
      </Text>

      <Text>{maxPlayers}</Text>

      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={7}
        maximumValue={24}
        step={1}
        value={maxPlayers}
        onValueChange={setMaxPlayers}
      />

      <Button onPress={onPress}>Создать</Button>
    </Column>
  );
}
