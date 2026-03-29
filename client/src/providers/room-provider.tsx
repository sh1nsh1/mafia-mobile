import { Message, messageSchema } from "@/schemas/message";
import { useCredentialsStore } from "@/stores/credentials-store";
import { useLobbyStore } from "@/stores/lobby-store";
import { AUTHORITY } from "@/utils/config";
import { FC, createContext, PropsWithChildren } from "react";
import { Observable } from "rxjs/internal/Observable";
import { webSocket } from "rxjs/webSocket";
import { map, retry } from "rxjs/operators";

interface RoomContextType {
  events: Observable<Message>;
  sendEvent: (message: Message) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: FC<PropsWithChildren> = ({ children }) => {
  const room = useLobbyStore.getState().currentLobby;

  if (!room) {
    throw new Error("Комнаты нету");
  }

  const accessToken = useCredentialsStore.getState().credentials?.accessToken;

  if (!accessToken) {
    throw new Error("accessToken нету");
  }

  const socket = webSocket<Message>(
    `ws://${AUTHORITY}/rooms/${room.lobbyId}?token=${accessToken}`,
  );

  const events = socket.pipe(
    retry(3),
    map(String),
    map(str => JSON.parse(str)),
    map(obj => messageSchema.parse(obj)),
  );

  const sendEvent = (message: Message) => socket.next(message);

  return (
    <RoomContext.Provider value={{ events, sendEvent }}>
      {children}
    </RoomContext.Provider>
  );
};
