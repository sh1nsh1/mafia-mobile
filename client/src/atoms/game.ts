import { Game } from "@/schemas/game";
import { atom } from "jotai";

export const asyncGameAtom = atom<Game | null>(null);
