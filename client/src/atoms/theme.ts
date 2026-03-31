import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage, unwrap } from "jotai/utils";

export type UserTheme = "light" | "dark" | "system";

const asyncStorage = createAsyncStorage("mafia-theme");
const storage = createJSONStorage<UserTheme | undefined>(() => asyncStorage);

export const asyncThemeAtom = atomWithStorage<UserTheme | undefined>(
  "mafia-theme",
  undefined,
  storage,
  {
    getOnInit: true,
  },
);

export const themeAtom = unwrap(asyncThemeAtom);
