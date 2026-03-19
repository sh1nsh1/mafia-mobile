import { router } from "expo-router";
import { User } from "@/schemas/user";
import { api } from "@utils/api";
import { Credentials } from "@/utils/credentials";
import { create } from "zustand";
import { UserRepository } from "@/repos/user-repository";

type AuthStore = AuthStoreState & AuthStoreActions;

interface AuthStoreState {
  user: User | null;
  credentials: Credentials | null;
  isLoggedIn: boolean;
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
  logIn: (name: string, password: string, redirect?: boolean) => Promise<void>;
  logOut: (redirect?: boolean) => Promise<void>;
  refreshCredentials: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  credentials: null,
  isLoggedIn: false,
  isInitialized: false,

  initialize: async () => {
    if (!get().isInitialized) {
      const credentials = await Credentials.fromStore();

      if (credentials) {
        set({ credentials });

        console.log("Найдены пользовательские данные! Пробую зайти...");
        console.log(credentials);

        const user = await UserRepository.getMe();
        user && set({ user, isLoggedIn: true });
      }

      set({ isInitialized: true });
    }
  },

  register: async (email, name, password, redirect = false) => {
    const response = await api.post(
      "user/register",
      { email, username: name, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const credentials = await Credentials.from(response.data);

    if (credentials) {
      set({ isLoggedIn: true, credentials });
      await credentials.saveToStore();

      const user = await UserRepository.getMe();

      if (user) {
        set({ user });
        if (redirect) {
          router.replace("/");
        }
      }
    } else {
      console.error(response.data);
      throw new Error("Ошибка при попытке регистрации");
    }
  },

  logIn: async (name, password, redirect = false) => {
    const response = await api.postForm("/user/login", {
      username: name,
      password,
    });
    const credentials = await Credentials.from(response.data);

    if (credentials) {
      set({ isLoggedIn: true, credentials });
      await credentials.saveToStore();

      const user = await UserRepository.getMe();

      if (user) {
        set({ user });

        if (redirect) {
          router.replace("/");
        }
      }
    } else {
      console.error(response.data);
      throw new Error("Ошибка при попытке входа");
    }
  },

  logOut: async (redirect = false) => {
    set({ isLoggedIn: false, credentials: null });
    Credentials.removeFromStore();

    if (redirect) {
      router.replace("/login");
    }
  },

  refreshCredentials: async () => {
    const authStore = useAuthStore.getState();
    const refreshToken = authStore.credentials?.refreshToken;

    if (!refreshToken) {
      return;
    }

    const result = await api.post("/user/refresh", {
      refreshToken,
    });

    const credentials = await Credentials.from(result.data);

    if (credentials) {
      set({ credentials });
      credentials.saveToStore();
    }
  },
}));
