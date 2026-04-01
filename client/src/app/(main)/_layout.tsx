import { asyncLobbyAtom } from "@/atoms/lobby";
import { socketAtom } from "@/atoms/socket";
import { Stack } from "expo-router";
import { useAtomValue } from "jotai";

export default function MainLayout() {
  const lobby = useAtomValue(asyncLobbyAtom);
  const socket = useAtomValue(socketAtom);
  // const game = useAtomValue(asyncGameAtom);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Protected guard={false && !lobby && socket !== null}>
        <Stack.Screen name="game" />
      </Stack.Protected>

      {/*Если лобби есть, то будет экран лобби*/}
      <Stack.Protected guard={lobby !== null && true && socket !== null}>
        <Stack.Screen name="lobby" />
      </Stack.Protected>

      <Stack.Protected guard={lobby === null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Screen name="logout" />
    </Stack>
  );
}
