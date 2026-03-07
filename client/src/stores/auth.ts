import { api } from "src/utils/api";
import { Credentials } from "src/utils/credentials";
import { create } from "zustand";

interface User {
  name: string;
}

type AuthStore = AuthStoreState & AuthStoreActions;

interface AuthStoreState {
  user: User | null;
  credentials: Credentials | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
}

interface AuthStoreActions {
  initialize: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logIn: (name: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  save: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  credentials: null,
  isLoggedIn: false,
  isInitialized: false,

  initialize: async () => {
    if (!get().isInitialized) {
      console.log("Store init");
      const credentials = await Credentials.fromStore();

      set({
        credentials,
        isLoggedIn: credentials !== null,
        isInitialized: true,
      });
    }
  },

  register: async (email, name, password) => {
    const response = await api.post(
      "user/register",
      { email, username: name, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const credentials = await Credentials.fromResponse(response.data);

    if (credentials) {
      set({ isLoggedIn: true, credentials });
      get().save();
    } else {
      throw new Error("Ошибка при попытке регистрации");
    }
  },

  logIn: async (name, password) => {
    const response = await api.post(
      "/user/login",
      {
        username: name,
        password,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const credentials = await Credentials.fromResponse(response.data);

    if (credentials) {
      set({ isLoggedIn: true, credentials });
      get().save();
    } else {
      throw new Error("Ошибка при попытке входа");
    }
  },

  logOut: async () => {
    set({ isLoggedIn: false, credentials: null });
    get().save();
  },

  save: async () => {
    const credentials = get().credentials;

    if (credentials) {
      credentials.save();
    } else {
      Credentials.remove();
    }
  },
}));
