import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage, unwrap } from "jotai/utils";

export type UserTheme = "light" | "dark" | "system";

const storage = createJSONStorage<UserTheme | undefined>(() => AsyncStorage);

export const asyncThemeAtom = atomWithStorage<UserTheme | undefined>(
  "mafia-theme",
  undefined,
  storage,
  {
    getOnInit: false,
  },
);

export const themeAtom = unwrap(asyncThemeAtom);
