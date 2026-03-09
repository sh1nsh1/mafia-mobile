import { useRouter } from "expo-router";
import { User, userSchema } from "src/schemas/user";
import { api } from "@utils/api";
import { Credentials } from "src/utils/credentials";
import { create } from "zustand";

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
  save: () => Promise<void>;
}

const router = useRouter();

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

        const result = await api
          .get("user/me", {
            headers: {
              Authorization: `Bearer ${credentials.accessToken}`,
              "Content-Type": "application/json",
            },
          })
          .then(response => userSchema.safeParse(response.data));

        if (result.success) {
          set({ user: result.data, isLoggedIn: true });
        }
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
      get().save();
    } else {
      throw new Error("Ошибка при попытке регистрации");
    }

    if (redirect) {
      router.replace("/");
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
      get().save();
    } else {
      throw new Error("Ошибка при попытке входа");
    }

    if (redirect) {
      router.replace("/");
    }
  },

  logOut: async (redirect = false) => {
    set({ isLoggedIn: false, credentials: null });
    get().save();

    if (redirect) {
      router.replace("/login");
    }
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
