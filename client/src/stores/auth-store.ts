import { router } from "expo-router";
import { User } from "@/schemas/user";
import { create } from "zustand";
import { UserRepository } from "@/repos/user-repository";
import { useLobbyStore } from "./lobby-store";
import { useCredentialsStore } from "./credentials-store";
import { AuthRepository } from "@/repos/auth-repository";

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
      const credentials = useCredentialsStore.getState().credentials;
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
    useCredentialsStore.setState({ credentials: null });
    set({ user: null });

    if (redirect) {
      router.replace("/login");
    }
  },
}));
