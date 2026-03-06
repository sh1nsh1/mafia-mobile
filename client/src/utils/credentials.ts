import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class Credentials {
  constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static async fromResponse(response: Response): Promise<Credentials | null> {
    const body = await response.json();

    if ("accessToken" in body && body["refreshToken"]) {
      const { accessToken, refreshToken } = body;
      return new Credentials(accessToken, refreshToken);
    } else {
      return null;
    }
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

  async setToStore() {
    const { accessToken, refreshToken } = this;

    await Promise.all([
      set(ACCESS_TOKEN_KEY, accessToken),
      set(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  static async remove() {
    await Promise.all([del(ACCESS_TOKEN_KEY), del(REFRESH_TOKEN_KEY)]);
  }
}

async function get(key: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
}

async function set(key: string, value: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.setItem(key, value);
  } else {
    return SecureStore.setItemAsync(key, value);
  }
}

async function del(key: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.removeItem(key);
  } else {
    return SecureStore.deleteItemAsync(key);
  }
}
