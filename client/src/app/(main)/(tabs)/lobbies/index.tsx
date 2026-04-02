import { LobbyList } from "@/components/LobbyList";
import { SpinnerScreen } from "@/components/SpinnerScreen";
import { Button, Column, Row, Text } from "@/components/ui";
import { LobbyRepository } from "@/repos/lobby-repository";
import { useRouter } from "expo-router";
import { Suspense, useState } from "react";

export default function LobbyListScreen() {
  const router = useRouter();
  const [lobbiesPromise, setLobbiesPromise] = useState(() =>
    LobbyRepository.getAll(),
  );

  const fetchLobbies = () => {
    setLobbiesPromise(LobbyRepository.getAll());
  };

  return (
    <Column flex={1} justify="center" items="center" gap={9} style={{ padding: 12 }}>
      <Text size={64} align="center" header>
        Доступные лобби
      </Text>

      <Suspense fallback={<SpinnerScreen />}>
        <LobbyList lobbiesPromise={lobbiesPromise} />
      </Suspense>

      <Row gap={12}>
        <Button onPress={fetchLobbies}>Обновить</Button>
        <Button onPress={() => router.push("/lobbies/new")}>Создать</Button>
      </Row>
    </Column>
  );
}
