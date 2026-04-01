import { Message, messageSchema } from "@/schemas/message";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { map, EMPTY } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { lobbyAtom } from "./lobby";
import { AUTHORITY } from "@/utils/config";
import { tokensAtom } from "./jwt-tokens";

export const socketAtom = atom<WebSocketSubject<string> | null>(get => {
  const lobby = get(lobbyAtom);
  const tokens = get(tokensAtom);

  if (lobby && tokens) {
    const url = `ws://${AUTHORITY}/rooms/${lobby.lobbyId}?token=${tokens.accessToken}`;
    return webSocket(url);
  } else {
    return null;
  }
});

export const eventsAtom = atomWithObservable<Message>(get => {
  const socket = get(socketAtom);

  return socket
    ? socket.pipe(
        map(input => JSON.parse(input)),
        map(o => messageSchema.parse(o)),
      )
    : EMPTY;
});
