import { useAuthStore } from "@/stores/auth-store";
import { useWebSocket } from "./useWebSocket";
import { AUTHORITY } from "@/utils/config";
import { useLobbyStore } from "@/stores/lobby-store";

function getlobbyUrl(id: string, accessToken: string) {
  return `ws://${AUTHORITY}/rooms/${id}?token=${accessToken}`;
}

export const useRoom = () => {
  const accessToken = useAuthStore.getState().credentials?.accessToken;

  if (!accessToken) {
    return null;
  }

  const id = useLobbyStore.getState().currentLobby?.lobbyId;

  if (!id) {
    return null;
  }

  const lobbyUrl = getlobbyUrl(id, accessToken);
  const socket = useWebSocket(lobbyUrl);

  return socket;
};
