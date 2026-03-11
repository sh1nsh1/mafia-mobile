import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as z from "zod";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const credentialsSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class Credentials {
  constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static async from(o: object): Promise<Credentials | null> {
    const result = credentialsSchema.safeParse(o);

    if (result.success) {
      const { accessToken, refreshToken } = result.data;
      return new Credentials(accessToken, refreshToken);
    }

    return null;
  }

  static async fromStore(): Promise<Credentials | null> {
    const [accessToken, refreshToken] = await Promise.all([
      get(ACCESS_TOKEN_KEY),
      get(REFRESH_TOKEN_KEY),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return new Credentials(accessToken, refreshToken);
  }

  async saveToStore() {
    const { accessToken, refreshToken } = this;

    await Promise.all([
      set(ACCESS_TOKEN_KEY, accessToken),
      set(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  static async removeFromStore() {
    await Promise.all([del(ACCESS_TOKEN_KEY), del(REFRESH_TOKEN_KEY)]);
  }
}

async function get(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
}

async function set(key: string, value: string) {
  if (Platform.OS === "web") {
    return localStorage.setItem(key, value);
  } else {
    return SecureStore.setItemAsync(key, value);
  }
}

async function del(key: string) {
  if (Platform.OS === "web") {
    return localStorage.removeItem(key);
  } else {
    return SecureStore.deleteItemAsync(key);
  }
}
