import { FC, createContext, PropsWithChildren, useEffect } from "react";

interface AuthContextType {
  user: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {}, []);

  return <AuthContext.Provider value={undefined}>{children}</AuthContext.Provider>;
};
