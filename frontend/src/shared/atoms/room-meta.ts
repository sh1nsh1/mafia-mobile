import { atom } from "jotai";
import { unwrap } from "jotai/utils";
import { api } from "@/utils/api";

export type RoomMeta = {
  roomId: string;
  isLobby: boolean;
};

export const asyncRoomMetaAtom = atom<RoomMeta | null>(null);

asyncRoomMetaAtom.onMount = set => {
  api.get("/user/room").then(response => set(response.data));
};

export const roomMetaAtom = unwrap(asyncRoomMetaAtom);
