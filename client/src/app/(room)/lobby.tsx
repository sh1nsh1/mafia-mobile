import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useEffect } from "react";
import { retry } from "rxjs/operators";
import { messageSchema, useRoomContext } from "./_layout";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";

export default function CurrentLobbyScreen() {
  const { currentLobby, exitLobby } = useLobbyStore();
  const { socket } = useRoomContext();
  const router = useRouter();

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
        complete() {
          console.log("done");
        },
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
      <Text>Ты {currentLobby === null && "не"} в лобби</Text>

      {currentLobby !== null ? (
        <>
          <Text>{"Лобби: " + JSON.stringify(currentLobby)}</Text>
          <Button onPress={exit}>Выйти</Button>
        </>
      ) : (
        <Button onPress={() => router.replace("/")}>На главную</Button>
      )}
    </Column>
  );
}
