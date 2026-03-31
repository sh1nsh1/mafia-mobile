import { UserRepository } from "@/repos/user-repository";
import { asyncTokensAtom, tokensAtom } from "./jwt-tokens";
import { atom } from "jotai";
import { unwrap } from "jotai/utils";

export const asyncUserAtom = atom(async get => {
  const jwtTokens = get(tokensAtom);

  console.log("юзер обновляется", jwtTokens);

  return jwtTokens ? UserRepository.getMe() : undefined;
});

export const userAtom = unwrap(asyncUserAtom);
