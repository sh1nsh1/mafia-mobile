import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useAuthStore } from "@/stores/auth-store";
import { useLobbyStore } from "@/stores/lobby-store";
import { AUTHORITY } from "@/utils/config";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { retry } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";

function getLobbyUrl(id: string, accessToken: string) {
  return `ws://${AUTHORITY}/rooms/${id}?token=${accessToken}`;
}

export default function CurrentLobbyScreen() {
  const { currentLobby, exitLobby } = useLobbyStore();
  const credentials = useAuthStore(auth => auth.credentials);
  const router = useRouter();
  const socket = useMemo(() => {
    if (credentials?.accessToken && currentLobby?.lobbyId) {
      return webSocket(getLobbyUrl(currentLobby.lobbyId, credentials.accessToken));
    } else {
      return null;
    }
  }, [credentials, currentLobby]);

  useEffect(() => {
    if (socket) {
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
      };
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
