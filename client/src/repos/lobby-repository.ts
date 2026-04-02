import { api } from "@/utils/api";
import { Lobby, lobbySchema } from "@/schemas/lobby";
import * as z from "zod";

export class LobbyRepository {
  /**
   *
   * @returns
   * @throws Axios or Zod error
   */
  static async getAll(): Promise<Lobby[]> {
    const lobbies = await api
      .get("/lobbies")
      .then(response => z.array(lobbySchema).parseAsync(response.data));

    return lobbies;
  }

  static async active() {
    return api
      .get("/user/lobby")
      .then(response => lobbySchema.nullable().parseAsync(response.data));
  }
}
