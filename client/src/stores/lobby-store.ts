import { Lobby, lobbySchema } from "@/schemas/lobby";
import { api } from "@/utils/api";
import { create } from "zustand";
import { useAuthStore } from "./auth-store";

type LobbyStore = {
  currentLobby: Lobby | null;
  error: Error | null;
  isInitialized: boolean;

  init: () => Promise<void>;

  /**
   * Создание лобби и заход в него
   */
  createLobby: (maxPlayers: number) => Promise<void>;
  joinLobby: (lobbyId: string) => Promise<void>;
  exitLobby: () => Promise<void>;
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
          .then(response => lobbySchema.nullable().parseAsync(response.data))
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

    joinLobby: async lobbyId => {
      console.log("Захожу в лобби...");

      await api
        .post(`/lobbies/${lobbyId}/join`)
        .then(response => lobbySchema.parseAsync(response.data))
        .then(lobby => {
          console.log("Current Lobby" + JSON.stringify(lobby));
          set({ currentLobby: lobby });
        })
        .catch(handleError);
    },

    exitLobby: async () => {
      console.log("Пытаюсь выйти из лобби...");
      const lobbyId = get().currentLobby?.lobbyId;

      if (lobbyId) {
        console.log("Выхожу из лобби...");
        await api.post(`lobbies/${lobbyId}/leave`).catch(handleError);
        set({ currentLobby: null });
      }
    },
  };
});
