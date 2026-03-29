import { UserContext } from "@/providers/auth-provider";
import { useContext } from "react";

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("Можно использовать только внутри AuthProvider");
  }

  return context;
};
