import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function AuthPage() {
  return (
    <View style={styles.view}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    gap: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
