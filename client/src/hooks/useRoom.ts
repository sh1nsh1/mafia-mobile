import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { retry } from "rxjs/operators";
import { useAuthStore } from "@/stores/auth";

interface Message {
  type: string;
  data: any;
}

function roomUrl(id: string, accessToken: string) {
  return `ws://localhost:8000/room/${id}?token=${accessToken}`;
}

export const useRoom = (id: string) => {
  let socket: WebSocketSubject<Message> | null = null;

  const connect = () => {
    if (socket) return socket;

    let accessToken = useAuthStore.getState().credentials?.accessToken;

    if (!accessToken) return null;

    socket = webSocket<Message>({
      url: roomUrl(id, accessToken),
      openObserver: {
        next: () => console.log("WebSocket подключен"),
      },
      closeObserver: {
        next: () => {
          console.log("WebSocket отключен");
          socket = null;
        },
      },
    });

    // Автоматический реконнект
    return socket.pipe(retry(5));
  };

  const sendMessage = (message: Message) => {
    socket?.next(message);
  };

  const disconnect = () => {
    socket?.complete();
    socket = null;
  };

  return { connect, sendMessage, disconnect };
};
