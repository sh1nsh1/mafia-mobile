import { credentialsSchema } from "@/schemas/credentials";
import { useCredentialsStore } from "@/stores/credentials-store";
import { api } from "@/utils/api";

export class AuthRepository {
  static async login() {}

  static async register() {}

  static async refresh(): Promise<void> {
    const { credentials, setCredentials } = useCredentialsStore.getState();
    const refreshToken = credentials?.refreshToken;

    if (!refreshToken) {
      throw new Error("refresh нету");
    }

    return api
      .post("/user/refresh", {
        refreshToken,
      })
      .then(response => credentialsSchema.parseAsync(response.data))
      .then(setCredentials);
  }
}
