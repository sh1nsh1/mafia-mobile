import { Lobby, lobbySchema } from "@/schemas/lobby";
import { api } from "@/utils/api";
import { create } from "zustand";

type LobbyStore = {
  currentLobby: Lobby | null;
  lobbies: Lobby[];

  setLobby: (lobby?: Lobby) => void;
  fetchLobbies: () => Promise<void>;
};

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  currentLobby: null,
  lobbies: [],

  setLobby: lobby => set({ currentLobby: lobby }),

  fetchLobbies: async () => {
    const response = await api.get("/lobbies").catch(console.error);

    if (response && Array.isArray(response.data)) {
      let lobbies: Lobby[] = [];

      for (const obj in response.data) {
        const result = lobbySchema.safeParse(obj);

        if (result.success) {
          lobbies.push(result.data);
        }
      }

      set({ lobbies });
    }
  },
}));
