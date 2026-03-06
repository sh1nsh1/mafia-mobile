import { Credentials } from "utils/credentials";
import { create } from "zustand";

const ROOT_URL = "http://localhost:8000";

interface User {
  name: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;

  credentials: () => Promise<Credentials | null>;
  register: (email: string, name: string, password: string) => Promise<Credentials>;
  login: (name: string, password: string) => Promise<Credentials>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => {
  let cachedCredentials: Credentials | null = null;

  return {
    user: null,
    loading: false,

    credentials: async () => {
      cachedCredentials ??= await Credentials.fromStore();

      return cachedCredentials;
    },

    register: async (email, name, password) => {
      const response = await fetch(`${ROOT_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username: name, password }),
      });

      if (!response.ok) {
        throw new Error("Что-то пошло не так");
      }

      const credentials = await Credentials.fromResponse(response);

      if (credentials) {
        await credentials.setToStore();
        return credentials;
      } else {
        throw new Error("There is no credentials");
      }
    },

    login: async (name, password) => {
      const form = new FormData();
      form.append("username", name);
      form.append("password", password);

      const response = await fetch(`${ROOT_URL}/user/login`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error("Неверные данные");
      }

      const credentials = await Credentials.fromResponse(response);

      if (credentials) {
        await credentials.setToStore();
        return credentials;
      } else {
        throw new Error("There is no credentials");
      }
    },

    logout: async () => Credentials.removeFromStore(),
  };
});
