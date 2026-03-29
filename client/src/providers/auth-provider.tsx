import { User } from "@/schemas/user";
import { useAuthStore } from "@/stores/auth-store";
import { FC, createContext, PropsWithChildren } from "react";

interface UserContextType {
  user: User;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Гарантирует что user не null
 * @throws Если user === null
 */
export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const user = useAuthStore.getState().user;

  if (!user) {
    throw new Error("Юзера нету");
  }

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
