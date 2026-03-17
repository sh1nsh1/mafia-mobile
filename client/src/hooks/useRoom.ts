import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { retry } from "rxjs/operators";

interface Message {
  type: string;
  data: any;
}

function roomWsUrl(id: string) {
  return `ws://localhost:8000/room/${id}`;
}

export const useRoom = (id: string) => {
  let socket$: WebSocketSubject<Message> | null = null;

  const connect = () => {
    if (socket$) return socket$;

    socket$ = webSocket<Message>({
      url: roomWsUrl(id),
      openObserver: {
        next: () => console.log("WebSocket подключен"),
      },
      closeObserver: {
        next: () => {
          console.log("WebSocket отключен");
          socket$ = null;
        },
      },
    });

    // Автоматический реконнект
    return socket$.pipe(retry(5));
  };

  const sendMessage = (message: Message) => {
    socket$?.next(message);
  };

  const disconnect = () => {
    socket$?.complete();
    socket$ = null;
  };

  return { connect, sendMessage, disconnect };
};
