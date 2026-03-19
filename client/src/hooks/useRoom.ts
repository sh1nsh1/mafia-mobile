import { useAuthStore } from "@/stores/auth-store";
import { useWebSocket } from "./useWebSocket";

function lobbyUrl(id: string, accessToken: string) {
  return `ws://localhost:8000/room/${id}?token=${accessToken}`;
}

export const useLobby = (id?: string) => {
  if (!id) {
    return null;
  }

  const accessToken = useAuthStore.getState().credentials?.accessToken;

  if (!accessToken) {
    return null;
  }

  let socket = useWebSocket(lobbyUrl(id, accessToken));

  return socket;
};
