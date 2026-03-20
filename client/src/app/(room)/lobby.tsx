import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useEffect, useMemo } from "react";
import { retry } from "rxjs/operators";
import { useRoomContext } from "./_layout";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { messageSchema } from "@/schemas/message";
import Ionicons from "@/components/ui/Ionicons";
import Row from "@/components/ui/Row";

export default function CurrentLobbyScreen() {
  const { currentLobby, exitLobby } = useLobbyStore();
  const user = useAuthStore(s => s.user);
  const { socket } = useRoomContext();
  const router = useRouter();
  const participants = useMemo(
    () => currentLobby?.participants.filter(p => p !== user?.id),
    [currentLobby],
  );

  useEffect(() => {
    if (socket) {
      const subscription = socket.pipe(retry(3)).subscribe({
        next(x) {
          console.log(x);

          const result = messageSchema.safeParse(x);

          if (
            result.success &&
            result.data.messageType === "Command" &&
            result.data.payload.actionType === "Start"
          ) {
            console.log("Игра началась");
            router.replace("/game");
          }
        },
        error(e) {
          if (e instanceof Error) {
            console.error(e.message);
          } else {
            console.error(e);
          }
        },
        complete: () => console.log("Подключение закрыто"),
      });

      return () => subscription.unsubscribe();
    }
  }, [socket]);

  const exit = async () => {
    socket?.complete();
    await exitLobby();
    router.replace("/lobbies");
  };

  return (
    <Column
      flex={1}
      justify="center"
      items="center"
      gap={12}
      style={{ padding: 12 }}
    >
      <Text size={64} header>
        Ты{currentLobby === null && " не"} в лобби
      </Text>

      {currentLobby !== null ? (
        <>
          {currentLobby.lobbyId === user?.id && (
            <Text>Вы являетесь владельцем лобби</Text>
          )}

          {participants && participants.length > 0 ? (
            <Text>
              Участники: {currentLobby.participants.filter(p => p !== user?.id)}
            </Text>
          ) : (
            <Text>Кроме тебя никого нету</Text>
          )}

          <Row justify="center" items="center" gap={8}>
            <Ionicons name="people" size={24} />
            <Text>
              {currentLobby.participants.length}/{currentLobby.maxPlayers}
            </Text>
          </Row>

          <Button onPress={exit}>Выйти</Button>
        </>
      ) : (
        <Button onPress={() => router.replace("/")}>На главную</Button>
      )}
    </Column>
  );
}
