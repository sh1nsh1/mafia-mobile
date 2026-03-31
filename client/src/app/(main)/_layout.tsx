import { asyncLobbyAtom } from "@/atoms/lobby";
import { Stack } from "expo-router";
import { useAtomValue } from "jotai";

export default function MainLayout() {
  const lobby = useAtomValue(asyncLobbyAtom);
  // const game = useAtomValue(asyncGameAtom);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={false && !lobby}>
        <Stack.Screen name="game" />
      </Stack.Protected>

      {/*Если лобби есть, то будет экран лобби*/}
      <Stack.Protected guard={!!lobby}>
        <Stack.Screen name="lobby" />
      </Stack.Protected>

      <Stack.Protected guard={!lobby}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Screen name="logout" />
    </Stack>
  );
}
