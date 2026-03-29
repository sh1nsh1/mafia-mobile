import { UserProvider } from "@/providers/auth-provider";
import { Slot } from "expo-router";

export default function MainLayout() {
  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}
