import { useAuthStore } from "@/stores/auth-store";
import { useWebSocket } from "./useWebSocket";
import { AUTHORITY } from "@/utils/config";

function getlobbyUrl(id: string, accessToken: string) {
  return `ws://${AUTHORITY}/room/${id}?token=${accessToken}`;
}

export const useRoom = (id: string) => {
  const accessToken = useAuthStore.getState().credentials?.accessToken;

  if (!accessToken) {
    return null;
  }

  const lobbyUrl = getlobbyUrl(id, accessToken);
  const socket = useWebSocket(lobbyUrl);

  return socket;
};
