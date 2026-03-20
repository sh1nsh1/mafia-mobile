import { api } from "@utils/api";
import { User, userSchema } from "@/schemas/user";

export class UserRepository {
  static async getMe(): Promise<User | null> {
    const result = await api
      .get("/user/me")
      .then(response => userSchema.parse(response.data))
      .catch(console.error);

    return result ?? null;
  }
}
