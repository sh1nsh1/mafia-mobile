import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const ROOT_URL = "http://localhost:8080";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface User {
  name: string;
}

class Credentials {
  constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static async fromSecureStore(): Promise<Credentials> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!accessToken || !refreshToken) {
      throw new Error("Can't get credentials from secure store");
    }

    return new Credentials(accessToken, refreshToken);
  }

  async setToSecureStore() {
    const { accessToken, refreshToken } = this;

    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }
}

interface AuthStore {
  user: User | null;
  credentials: Credentials | null;
  loading: boolean;

  register: (email: string, name: string, password: string) => Promise<Credentials>;
  login: (name: string, password: string) => Promise<Credentials>;
  // hydrate: () => void;
}

export const useAuthStore = create<AuthStore>(set => {
  const hydrate = async () => {
    set({ loading: true });
    try {
      const credentials = await Credentials.fromSecureStore();
      set({ credentials });
    } finally {
      set({ loading: false });
    }
  };

  return {
    user: null,
    loading: false,
    credentials: null,

    register: async (email, name, password) => {
      const response = await fetch(`${ROOT_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username: name, password }),
      });

      if (!response.ok) {
        console.log("Not ok");
      }

      const credentials = await response.json();
      set({ credentials });

      return credentials;
    },

    login: async (name, password) => {
      const form = new FormData();
      form.append("username", name);
      form.append("password", password);

      const response = await fetch(`${ROOT_URL}/user/login`, {
        method: "POST",
        body: form,
      });

      const credentials = await response.json();
      set({ credentials });

      return credentials;
    },
  };
});
