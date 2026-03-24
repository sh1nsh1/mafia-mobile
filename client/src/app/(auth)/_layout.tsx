import { View } from "@/components/ui";
import { Slot } from "expo-router";

export default function AuthPage() {
  return (
    <View flex={1} gap={18} justify="center" items="center">
      <Slot />
    </View>
  );
}
