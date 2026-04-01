import { asyncLobbyAtom } from "@/atoms/lobby";
import { Text, Button, Column } from "@/components/ui";
import { lobbySchema } from "@/schemas/lobby";
import { api } from "@/utils/api";
import Slider from "@react-native-community/slider";
import { useAtom } from "jotai";
import { useState } from "react";

export default function CreateGameScreen() {
  const [maxPlayers, setMaxPlayers] = useState(5);

  const [, setLobby] = useAtom(asyncLobbyAtom);

  const createLobby = () =>
    api
      .post(
        "/lobbies",
        { maxPlayers },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then(response => response.data)
      .then(lobbySchema.parseAsync)
      .then(setLobby)
      .catch(console.error);

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
        minimumValue={5}
        maximumValue={24}
        step={1}
        value={maxPlayers}
        onValueChange={setMaxPlayers}
      />

      <Button onPress={createLobby}>Создать</Button>
    </Column>
  );
}
