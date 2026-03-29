import { Message, messageSchema } from "@/schemas/message";
import { useCredentialsStore } from "@/stores/credentials-store";
import { useLobbyStore } from "@/stores/lobby-store";
import { AUTHORITY } from "@/utils/config";
import { FC, createContext, PropsWithChildren, useEffect, useRef } from "react";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { map, retry, catchError } from "rxjs/operators";
import { Observable, EMPTY as EMPTY_OBS } from "rxjs";

interface RoomContextType {
  events: Observable<Message>;
  sendEvent: (message: Message) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: FC<PropsWithChildren> = ({ children }) => {
  const socketRef = useRef<WebSocketSubject<any> | null>(null);
  const eventsRef = useRef<Observable<Message>>(EMPTY_OBS);
  const lobby = useLobbyStore(s => s.currentLobby);
  const accessToken = useCredentialsStore(c => c.credentials?.accessToken);

  useEffect(() => {
    if (!lobby || !accessToken) {
      console.warn("Lobby или token недоступны");
      return;
    }

    const url = `ws://${AUTHORITY}/rooms/${lobby.lobbyId}?token=${accessToken}`;
    const socket = webSocket(url);
    socketRef.current = socket;

    const events = socket.pipe(
      map(msg => (typeof msg === "string" ? msg : JSON.stringify(msg))),
      map(str => JSON.parse(str)),
      map(obj => messageSchema.parse(obj)),
      retry(3),
      catchError(err => {
        console.error("WS error:", err);
        return EMPTY_OBS;
      }),
    );

    eventsRef.current = events;

    // return () => {
    //   socket.complete();
    //   socketRef.current = null;
    // };
  }, []);

  const sendEvent = (message: Message) => {
    socketRef.current?.next(message);
  };

  return (
    <RoomContext.Provider
      value={{
        events: eventsRef.current,
        sendEvent,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
