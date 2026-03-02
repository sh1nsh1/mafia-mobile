import { Redirect } from "expo-router";
import { useAuthStore } from "stores/auth";

export default function Index() {
  const authStore = useAuthStore();

  const path = authStore.user ? "/main" : "/login";

  return <Redirect href={path} />;
}
