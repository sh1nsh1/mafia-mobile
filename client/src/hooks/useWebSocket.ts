import { useRef } from "react";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";

/**
 * Создает сокет и автоматически подключается
 * @param url
 * @param opts
 * @returns Ref
 */
export function useWebSocket(
  url: string,
  opts?: Partial<ManagerOptions & SocketOptions>,
) {
  const socketRef = useRef<Socket>(
    io(url, {
      transports: ["websocket"],
      ...opts,
    }),
  );

  return socketRef;
}
