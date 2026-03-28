import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Credentials } from "@/schemas/credentials";
import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store";
import { Platform } from "react-native";

export type CredentialsStore = {
  credentials: Credentials | null;
  setCredentials: (credential: Credentials) => void;
};

export const useCredentialsStore = create(
  persist<CredentialsStore>(
    set => ({
      credentials: null,
      setCredentials: credentials => set({ credentials }),
    }),
    {
      name: "mafia-credentials-storage",
      storage: createJSONStorage(() =>
        Platform.OS === "web"
          ? // Лучше не использовать AsyncStorage для хранения токенов, но...
            AsyncStorage
          : {
              getItem: getItemAsync,
              setItem: setItemAsync,
              removeItem: deleteItemAsync,
            },
      ),
    },
  ),
);
