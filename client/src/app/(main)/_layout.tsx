import { asyncRoomMetaAtom } from "@/atoms/room-meta";
import { socketAtom } from "@/atoms/socket";
import { View, Text } from "@/components/ui";
import { ErrorBoundaryProps, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
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
  type LayoutState = "game" | "lobby" | "free";

  const roomMeta = useAtomValue(asyncRoomMetaAtom);
  const socket = useAtomValue(socketAtom);

  const [state, setState] = useState<LayoutState>("free");

  useEffect(() => {
    if (socket !== null && roomMeta !== null) {
      const newState = roomMeta.isLobby ? "lobby" : "game";
      state !== newState && setState(newState);
    } else {
      state !== "free" && setState("free");
    }
  }, [socket, roomMeta]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Остальное */}
      <Stack.Protected guard={state === "free"}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="logout" />
      </Stack.Protected>

      {/* Лобби */}
      <Stack.Protected guard={state === "lobby"}>
        <Stack.Screen name="lobby" />
      </Stack.Protected>

      {/* Игра */}
      <Stack.Protected guard={state === "game"}>
        <Stack.Screen name="game" />
      </Stack.Protected>
    </Stack>
  );
}
