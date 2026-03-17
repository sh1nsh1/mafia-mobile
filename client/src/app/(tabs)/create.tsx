import { api } from "@utils/api";
import { useState } from "react";
import { Button, H2, Slider, View } from "tamagui";

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
    console.log("Ошибка при создании лобби");
  }
}

export default function CreateGameScreen() {
  const [playerCount, setPlayerCount] = useState([7]);

  return (
    <View flex={1} gap="$6" items="center" justify="center" bg="$background" p="$4">
      <H2>Создай лобби</H2>

      <H2>{playerCount}</H2>

      <Slider
        min={7}
        max={24}
        step={1}
        width={200}
        value={playerCount}
        onValueChange={setPlayerCount}
      >
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        <Slider.Thumb theme="accent" size={18} circular />
      </Slider>

      <Button onPress={() => createLobby(playerCount[0])}>Создать</Button>
    </View>
  );
}
