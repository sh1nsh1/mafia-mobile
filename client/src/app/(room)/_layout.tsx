import { useAuthStore } from "@/stores/auth-store";
import { useLobbyStore } from "@/stores/lobby-store";
import { AUTHORITY } from "@/utils/config";
import { Slot } from "expo-router";
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as z from "zod";
import Row from "@/components/ui/Row";
import { ThemeToggler } from "@/components/ui/ThemeToggler";
import View from "@/components/ui/View";

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
      <ActionSheetProvider useCustomActionSheet={true}>
        <>
          <Row
            style={{
              padding: 12,
            }}
            justify="flex-end"
          >
            <ThemeToggler />
          </Row>
          <Slot />
        </>
      </ActionSheetProvider>
    </RoomProvider>
  );
}
