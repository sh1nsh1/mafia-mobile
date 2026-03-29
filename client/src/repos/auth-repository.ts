import { credentialsSchema } from "@/schemas/credentials";
import { useCredentialsStore } from "@/stores/credentials-store";
import { api } from "@/utils/api";

export class AuthRepository {
  static async login(name: string, password: string) {
    const { setCredentials } = useCredentialsStore.getState();

    return api
      .postForm("/user/login", {
        username: name,
        password,
      })
      .then(response => credentialsSchema.parseAsync(response.data))
      .then(setCredentials);
  }

  static async register(email: string, name: string, password: string) {
    const { setCredentials } = useCredentialsStore.getState();

    return api
      .post(
        "user/register",
        { email, username: name, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then(response => credentialsSchema.parseAsync(response.data))
      .then(setCredentials);
  }

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
