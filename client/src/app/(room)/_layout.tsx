import { useAuthStore } from "@/stores/auth-store";
import { useLobbyStore } from "@/stores/lobby-store";
import { AUTHORITY } from "@/utils/config";
import { Slot } from "expo-router";
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import * as z from "zod";

export type Message = z.infer<typeof messageSchema>;

export const messageSchema = z.object({
  messageType: z.enum(["Command", "Event"]),
  topic: z.enum(["Lobby", "Game", "System"]),
  timestamp: z.string(),
  payload: z.object(),
});

interface RoomContextType {
  socket: WebSocketSubject<unknown> | null;
}

interface Props {
  children: ReactNode;
}

const RoomContext = createContext<RoomContextType | null>(null);

function getLobbyUrl(id: string, accessToken: string) {
  return `ws://${AUTHORITY}/rooms/${id}?token=${accessToken}`;
}

export const RoomProvider: React.FC<Props> = ({ children }) => {
  const currentLobby = useLobbyStore(s => s.currentLobby);
  const credentials = useAuthStore(auth => auth.credentials);
  const socket = useMemo(() => {
    if (credentials?.accessToken && currentLobby?.lobbyId) {
      return webSocket(getLobbyUrl(currentLobby.lobbyId, credentials.accessToken));
    } else {
      return null;
    }
  }, [credentials, currentLobby]);

  return <RoomContext.Provider value={{ socket }}>{children}</RoomContext.Provider>;
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("Используйте useRoomContext внутри RoomProvider");
  }

  return context;
};

export default function Game() {
  return (
    <RoomProvider>
      <Slot />
    </RoomProvider>
  );
}
