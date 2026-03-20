import Text from "@/components/ui/Text";
import { useLobbyStore } from "@/stores/lobby-store";
import Button from "@components/ui/Button";
import Column from "@components/ui/Column";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function CreateGameScreen() {
  const [maxPlayers, setMaxPlayers] = useState(7);
  const router = useRouter();
  const { currentLobby, createLobby } = useLobbyStore();

  useEffect(() => {
    currentLobby && router.replace("/lobby");
  }, [currentLobby]);

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

      <Button onPress={() => createLobby(maxPlayers)}>Создать</Button>
    </Column>
  );
}
