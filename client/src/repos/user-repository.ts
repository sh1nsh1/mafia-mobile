import { api } from "@/utils/api";
import { User, userSchema } from "@/schemas/user";

export class UserRepository {
  /**
   *
   * @returns
   * @throws Axios or Zod error
   */
  static async getMe(): Promise<User> {
    const user = await api
      .get("/user/me")
      .then(response => userSchema.parse(response.data));

    return user;
  }
}
