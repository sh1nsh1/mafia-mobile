import { atom } from "jotai";
import { unwrap } from "jotai/utils";
import { api } from "@/utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";

export const asyncLobbyAtom = atom(
  async () =>
    await api
      .get("/user/lobby")
      .then(response => response.data)
      .then(lobbySchema.nullable().parseAsync),
  (_get, _set, lobby: Lobby) => lobby,
);

export const lobbyAtom = unwrap(asyncLobbyAtom);
