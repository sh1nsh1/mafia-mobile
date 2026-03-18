import View from "@/components/ui/View";
import { Slot } from "expo-router";
import { StyleSheet } from "react-native";

export default function AuthPage() {
  return (
    <View gap={18} justify="center" items="center" style={styles.view}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
});
