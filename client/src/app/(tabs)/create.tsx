import { api } from "@utils/api";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import Button from "@components/ui/Button";
import Column from "@components/ui/Column";
import Text from "@/components/ui/Text";

async function createLobby(maxPlayers: number) {
  const response = await api
    .post(
      "/lobbies",
      { maxPlayers },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .catch(console.error);

  if (response && response.status >= 200 && response.status < 300) {
    console.log("Лобби успешно создано");
  } else {
    console.error("Ошибка при создании лобби");
  }
}

export default function CreateGameScreen() {
  const [playerCount, setPlayerCount] = useState(7);

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

      <Text>{playerCount}</Text>

      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={7}
        maximumValue={24}
        step={1}
        value={playerCount}
        onValueChange={setPlayerCount}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />

      <Button onPress={() => createLobby(playerCount)}>Создать</Button>
    </Column>
  );
}
