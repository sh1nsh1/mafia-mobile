import { User } from "@/schemas/user";
import { FC, createContext, PropsWithChildren, useContext } from "react";
import { WebSocketSubject } from "rxjs/webSocket";

interface LobbyContextType {
  socket: WebSocketSubject<string>;
  user: User;
}

export const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const LobbyProvider: FC<PropsWithChildren<LobbyContextType>> = ({
  children,
  socket,
  user,
}) => {
  return (
    <LobbyContext.Provider value={{ socket, user }}>
      {children}
    </LobbyContext.Provider>
  );
};

export function useLobby() {
  const context = useContext(LobbyContext);

  if (!context) {
    throw new Error("нету LobbyProvider");
  }

  return context;
}
