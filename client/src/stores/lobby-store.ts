import { Lobby, lobbySchema } from "@/schemas/lobby";
import { api } from "@/utils/api";
import { create } from "zustand";
import * as z from "zod";
import { useAuthStore } from "./auth-store";

type LobbyStore = {
  currentLobby: Lobby | null;
  lobbies: Lobby[];
  error: Error | null;
  isInitialized: boolean;

  init: () => Promise<void>;

  /**
   * Создание лобби и заход в него
   */
  createLobby: (maxPlayers: number) => Promise<void>;
  enterLobby: (lobby: Lobby) => Promise<void>;
  exitLobby: () => Promise<void>;
  fetchLobbies: () => Promise<void>;
};

export const useLobbyStore = create<LobbyStore>((set, get) => {
  function handleError(error: any) {
    console.error(error);

    if (error instanceof Error) {
      set({ error });
    } else if (typeof error === "string") {
      set({ error: new Error(error) });
    } else {
      set({ error: new Error("Неизвестная ошибка!") });
    }
  }

  return {
    currentLobby: null,
    lobbies: [],
    error: null,
    isInitialized: false,

    init: async () => {
      if (!get().isInitialized && useAuthStore.getState().user) {
        await api
          .get("/user/lobby")
          .then(response => lobbySchema.optional().parseAsync(response.data))
          .then(lobby => set({ currentLobby: lobby, isInitialized: true }))
          .catch(handleError);
      }
    },

    createLobby: async maxPlayers => {
      console.log("Пытаюсь создать лобби...");
      set({ error: null });

      await api
        .post(
          "/lobbies",
          { maxPlayers },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
        .then(response => lobbySchema.parseAsync(response.data))
        .then(lobby => set({ currentLobby: lobby }))
        .catch(handleError);
    },

    enterLobby: async lobby => {
      console.log("Захожу в лобби...");

      await api.post(`/lobbies/${lobby.lobbyId}/join`).catch(handleError);
    },

    exitLobby: async () => {
      console.log("Выхожу лобби...");
      const lobbyId = get().currentLobby?.lobbyId;

      if (lobbyId) {
        await api.post(`lobbies/${lobbyId}/leave`).catch(handleError);
        set({ currentLobby: null });
      }
    },

    fetchLobbies: async () => {
      console.log("Ищу новые лобби...");
      set({ error: null });

      await api
        .get("/lobbies")
        .then(response => z.array(lobbySchema).parseAsync(response.data))
        .then(lobbies => set({ lobbies }))
        .catch(handleError);
    },
  };
});
