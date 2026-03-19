import { Lobby, lobbySchema } from "@/schemas/lobby";
import { api } from "@/utils/api";
import { create } from "zustand";

type LobbyStore = {
  activeLobby: Lobby | null;
  lobbies: Lobby[];

  setActiveLobby: (lobby: Lobby) => void;
  resetActiveLobby: () => void;

  fetchActiveLobby: () => Promise<void>;
  fetchLobbies: () => Promise<void>;
};

export const useLobbyStore = create<LobbyStore>(set => ({
  activeLobby: null,
  lobbies: [],

  setActiveLobby: lobby => set({ activeLobby: lobby }),
  resetActiveLobby: () => set({ activeLobby: null }),

  fetchActiveLobby: async () => {
    const response = await api.get("/user/lobby").catch(console.error);

    if (response && Array.isArray(response.data)) {
      const lobbies: Lobby[] = response.data
        .map(o => lobbySchema.safeParse(o))
        .filter(result => result.success)
        .map(r => r.data!);

      set({ lobbies });
    }
  },

  fetchLobbies: async () => {
    const response = await api.get("/lobbies").catch(console.error);

    if (response && Array.isArray(response.data)) {
      const lobbies: Lobby[] = response.data
        .map(o => lobbySchema.safeParse(o))
        .filter(result => result.success)
        .map(r => r.data!);

      set({ lobbies });
    }
  },
}));
