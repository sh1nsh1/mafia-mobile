import { create } from "zustand";

const initialState = { user: null };

interface AuthStore {
  user: null;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>(set => ({
  ...initialState,
  reset: () => set(initialState),
}));
