import { tokensAtom } from "@/atoms/jwt-tokens";
import { store } from "@/atoms/store";
import { jwtTokensSchema } from "@/schemas/jwt-tokens";
import { api } from "@/utils/api";

/**
 * Автоматически сохраняет токены в стор
 */
export class AuthRepository {
  static async login(name: string, password: string) {
    return api
      .postForm("/user/login", {
        username: name,
        password,
      })
      .then(response => jwtTokensSchema.parseAsync(response.data))
      .then(tokens => store.set(tokensAtom, tokens));
  }

  static async register(email: string, name: string, password: string) {
    return api
      .post(
        "/user/register",
        { email, username: name, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then(response => jwtTokensSchema.parseAsync(response.data))
      .then(tokens => store.set(tokensAtom, tokens));
  }

  static async refresh(): Promise<void> {
    const refreshToken = store.get(tokensAtom)?.refreshToken;

    if (!refreshToken) {
      throw new Error("refresh нету");
    }

    return api
      .post("/user/refresh", {
        refreshToken,
      })
      .then(response => jwtTokensSchema.parseAsync(response.data))
      .then(tokens => store.set(tokensAtom, tokens));
  }
}
