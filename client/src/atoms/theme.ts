import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage, unwrap } from "jotai/utils";

export type UserTheme = "light" | "dark" | "system";

const asyncStorage = createAsyncStorage("mafia-theme");
const storage = createJSONStorage<UserTheme | null>(() => asyncStorage);

export const asyncThemeAtom = atomWithStorage<UserTheme | null>(
  "mafia-theme",
  null,
  storage,
);

export const themeAtom = unwrap(asyncThemeAtom);
