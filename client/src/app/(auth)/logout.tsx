import Button from "@components/ui/Button";
import { Redirect, useRouter } from "expo-router";
import { Text, StyleSheet, View } from "react-native";
import { useAuthStore } from "src/stores/auth";

export default function Logout() {
  const authStore = useAuthStore();
  const router = useRouter();

  if (!authStore.isLoggedIn) {
    <Redirect href="/login" />;
  }

  return (
    <>
      <Text style={styles.text}>Name: {"username here"}</Text>

      <Text style={styles.text}>{authStore.credentials?.accessToken}</Text>
      <Text style={styles.text}>{authStore.credentials?.refreshToken}</Text>

      <View style={styles.view}>
        <Button onPress={() => router.replace("/")}>На главную</Button>
        <Button onPress={async () => await authStore.logOut(true)}>Выйти</Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  text: {},
  view: { flex: 1, flexDirection: "row", gap: 12 },
});
