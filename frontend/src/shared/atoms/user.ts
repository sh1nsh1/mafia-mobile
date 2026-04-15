import { UserRepository } from "@/repos/user-repository";
import { asyncTokensAtom } from "./jwt-tokens";
import { atom } from "jotai";
import { unwrap } from "jotai/utils";

export const asyncUserAtom = atom(async get => {
  const jwtTokens = await get(asyncTokensAtom);

  console.log("юзер обновляется", jwtTokens);

  return jwtTokens ? UserRepository.getMe() : undefined;
});

export const userAtom = unwrap(asyncUserAtom);
