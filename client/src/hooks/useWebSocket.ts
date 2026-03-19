import { useRef } from "react";
import { webSocket } from "rxjs/webSocket";

/**
 * Создает сокет и автоматически подключается
 * @param url
 * @returns Ref
 */
export function useWebSocket<T>(url: string) {
  const socket = webSocket<T>(url);
  const socketRef = useRef(socket);

  return socketRef;
}
