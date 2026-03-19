import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useLobby } from "@/hooks/useRoom";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { fromEvent, Observable } from "rxjs";

export default function CurrentLobbyScreen() {
  const { currentLobby } = useLobbyStore();
  const router = useRouter();
  const socket = useLobby(currentLobby?.lobbyId);

  useEffect(() => {
    if (!socket) {
      console.error("Не могу создать сокет :(");
      router.replace("/lobbies");
      return;
    }

    socket.current.on("connect", () => console.log("Подключено"));
    socket.current.on("disconnect", () => console.log("Отключено"));

    const pipe: Observable<any> = fromEvent(socket.current, "connect");

    pipe.subscribe({
      next(x) {
        console.log(x);
      },
      error(err) {
        console.error("something wrong occurred: " + err);
      },
      complete() {
        console.log("done");
      },
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const exit = () => {
    // delete active lobby
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
      <Text>Ты в своём лобби</Text>

      <Text>{"Лобби: " + JSON.stringify(currentLobby)}</Text>

      <Button onPress={exit}>Выйти</Button>
    </Column>
  );
}
