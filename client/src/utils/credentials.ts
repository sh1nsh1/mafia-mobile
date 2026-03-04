import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const isWeb = Platform.OS === "web";

export class Credentials {
  constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

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
}

async function get(key: string) {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
}

async function set(key: string, value: string) {
  if (isWeb) {
    return AsyncStorage.setItem(key, value);
  } else {
    return SecureStore.setItemAsync(key, value);
  }
}
