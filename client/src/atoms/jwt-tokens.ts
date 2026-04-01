import { JwtTokens } from "@/schemas/jwt-tokens";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { atomWithStorage, createJSONStorage, unwrap } from "jotai/utils";
import { Platform } from "react-native";

const asyncStorage = createAsyncStorage("jwt-tokens");

const storage = createJSONStorage<JwtTokens | undefined>(() =>
  Platform.OS === "web"
    ? // Лучше не использовать AsyncStorage для хранения токенов, но...
      asyncStorage
    : {
        getItem: getItemAsync,
        setItem: setItemAsync,
        removeItem: deleteItemAsync,
      },
);

export const asyncTokensAtom = atomWithStorage<JwtTokens | undefined>(
  "mafia-jwt-tokens",
  undefined,
  storage,
  {
    getOnInit: false,
  },
);

export const tokensAtom = unwrap(asyncTokensAtom);
