import { FC, createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthContext.Provider value={undefined}>{children}</AuthContext.Provider>;
};
