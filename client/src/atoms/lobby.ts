import { atom } from "jotai";
import { unwrap } from "jotai/utils";
import { api } from "@/utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";

export const asyncLobbyAtom = atom<Lobby | null>(null);

asyncLobbyAtom.onMount = setLobby => {
  api
    .get("/user/lobby")
    .then(response => response.data)
    .then(lobbySchema.nullable().parseAsync)
    .then(setLobby);
};

export const lobbyAtom = unwrap(asyncLobbyAtom);
