import { LobbyList } from "@/components/LobbyList";
import { Button, Column, Row, Text } from "@/components/ui";
import { LobbyRepository } from "@/repos/lobby-repository";
import { Lobby } from "@/schemas/lobby";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function LobbyListScreen() {
  const router = useRouter();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  function fetchLobbies() {
    LobbyRepository.getAll().then(setLobbies);
  }

  useEffect(() => {
    if (useLobbyStore.getState().currentLobby !== null) {
      router.replace("/lobby");
    } else {
      fetchLobbies();
    }
  }, []);

  return (
    <Column flex={1} justify="center" items="center" gap={9} style={{ padding: 12 }}>
      <Text size={64} align="center" header>
        Доступные лобби
      </Text>

      <LobbyList lobbies={lobbies} />

      <Row gap={12}>
        <Button onPress={fetchLobbies} pressableStyle={{ alignSelf: "center" }}>
          Обновить
        </Button>
        <Button
          onPress={() => router.push("/lobbies/new")}
          pressableStyle={{ alignSelf: "center" }}
        >
          Создать
        </Button>
      </Row>
    </Column>
  );
}
