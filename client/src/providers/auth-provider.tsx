import { User } from "@/schemas/user";
import { useAuthStore } from "@/stores/auth-store";
import { FC, createContext, PropsWithChildren } from "react";

interface UserContextType {
  user: User | null;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Гарантирует что user не null
 * @throws Если user === null
 */
export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  console.log("auth provider");
  const user = useAuthStore.getState().user;
  console.log(user);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
