import { useLobbyStore } from "@/stores/lobby-store";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";

export default function LobbiesLayout() {
  const router = useRouter();
  const lobbyStore = useLobbyStore();

  useEffect(() => {
    const hasActiveLobby = lobbyStore.currentLobby !== null;

    if (hasActiveLobby) {
      router.replace("/lobbies/current");
    }
  }, []);

  return <Slot />;
}
