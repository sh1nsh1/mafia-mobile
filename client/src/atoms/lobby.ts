import { atom } from "jotai";
import { unwrap } from "jotai/utils";
import { asyncUserAtom } from "./user";
import { LobbyRepository } from "@/repos/lobby-repository";

export const asyncLobbyAtom = atom(async get => {
  const user = await get(asyncUserAtom);

  return user ? LobbyRepository.active() : undefined;
});

export const lobbyAtom = unwrap(asyncLobbyAtom);
