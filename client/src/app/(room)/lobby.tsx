import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useRoom } from "@/hooks/useRoom";
import { useLobbyStore } from "@/stores/lobby-store";
import { api } from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { retry } from "rxjs/operators";

export default function CurrentLobbyScreen() {
  const currentLobby = useLobbyStore(s => s.currentLobby);
  const router = useRouter();
  const socket = useRoom(currentLobby!.lobbyId);

  useEffect(() => {
    if (!socket) {
      console.error("Не могу создать сокет :(");
      router.replace("/");
      return;
    }

    const subscription = socket.pipe(retry(3)).subscribe({
      next(x) {
        console.log(x);
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

    return () => {
      subscription.unsubscribe();
      socket.complete();

      if (currentLobby) {
        api.post(`lobbies/${currentLobby.lobbyId}/leave`);
      }
    };
  }, []);

  const exit = () => {
    socket?.complete();
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
      <Text>Ты в лобби</Text>

      <Text>{"Лобби: " + JSON.stringify(currentLobby)}</Text>

      <Button onPress={exit}>Выйти</Button>
    </Column>
  );
}
