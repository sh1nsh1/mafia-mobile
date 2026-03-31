import { router } from "expo-router";
import { User } from "@/schemas/user";
import { create } from "zustand";
import { UserRepository } from "@/repos/user-repository";
import { useLobbyStore } from "./lobby-store";
import { AuthRepository } from "@/repos/auth-repository";
import { tokensAtom } from "@/atoms/jwt-tokens";
import { store } from "@/atoms/store";
import { RESET } from "jotai/utils";

type AuthStore = AuthStoreState & AuthStoreActions;

interface AuthStoreState {
  user: User | null;
  isInitialized: boolean;
}

interface AuthStoreActions {
  initialize: () => Promise<void>;
  register: (
    email: string,
    name: string,
    password: string,
    redirect?: boolean,
  ) => Promise<void>;
  login: (name: string, password: string, redirect?: boolean) => Promise<void>;
  logout: (redirect?: boolean) => Promise<void>;
}

/** Содержит данные о текущем пользователе */
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isInitialized: false,

  initialize: async () => {
    if (!get().isInitialized) {
      const credentials = store.get(tokensAtom);
      console.log(credentials);

      if (credentials) {
        console.log("Найдены пользовательские данные! Пробую зайти...");

        await UserRepository.getMe().then(user => set({ user }));
        await useLobbyStore.getState().init().catch(console.error);
      }

      set({ isInitialized: true });
    }
  },

  register: async (email, name, password, redirect = false) => {
    await AuthRepository.register(email, name, password);
    await UserRepository.getMe().then(user => set({ user }));

    if (redirect) {
      router.replace("/");
    }
  },

  login: async (name, password, redirect = false) => {
    await AuthRepository.login(name, password);
    await UserRepository.getMe().then(user => set({ user }));

    if (redirect) {
      router.replace("/(main)/(tabs)");
    }
  },

  logout: async (redirect = false) => {
    store.set(tokensAtom, RESET);
    set({ user: null });

    if (redirect) {
      router.replace("/login");
    }
  },
}));
