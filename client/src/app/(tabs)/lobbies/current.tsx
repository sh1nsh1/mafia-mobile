import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useLobbyStore } from "@/stores/lobby-store";
import { Redirect } from "expo-router";

export default function CurrentLobbyScreen() {
  const { activeLobby, resetActiveLobby } = useLobbyStore();

  return activeLobby !== null ? (
    <Column>
      <Text> Ты в своём лобби</Text>
      <Button onPress={resetActiveLobby}>Выйти</Button>
    </Column>
  ) : (
    <Redirect href="/lobbies" />
  );
}
