import { asyncGameAtom } from "@/atoms/game";
import { asyncLobbyAtom } from "@/atoms/lobby";
import { socketAtom } from "@/atoms/socket";
import { View, Text } from "@/components/ui";
import { LobbyProvider } from "@/providers/lobby-provider";
import { ErrorBoundaryProps, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{error.message}</Text>
      <Text onPress={retry} style={{ borderWidth: 1 }}>
        Try Again?
      </Text>
    </View>
  );
}

export default function MainLayout() {
  const game = useAtomValue(asyncGameAtom);
  const lobby = useAtomValue(asyncLobbyAtom);
  const socket = useAtomValue(socketAtom);

  const state: "game" | "lobby" | "free" = useMemo(() => {
    if (socket !== null) {
      if (game !== null && lobby === null) {
        return "game";
      } else if (lobby !== null && game === null) {
        return "lobby";
      } else {
        throw new Error("Невозможное состояние");
      }
    } else if (lobby === null && socket === null) {
      return "free";
    } else {
      throw new Error("Невозможное состояние");
    }
  }, [lobby, socket, game]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      {/* Игра */}
      <Stack.Protected guard={state === "game"}>
        <Stack.Screen name="game" />
      </Stack.Protected>

      {/* Если лобби есть, то будет экран лобби */}
      <Stack.Protected guard={state === "lobby"}>
        <LobbyProvider socket={socket!}>
          <Stack.Screen name="lobby" />
        </LobbyProvider>
      </Stack.Protected>

      {/* Остальное */}
      <Stack.Protected guard={state === "free"}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="logout" />
      </Stack.Protected>
    </Stack>
  );
}
