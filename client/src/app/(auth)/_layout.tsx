import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Slot } from "expo-router";
import { View } from "tamagui";

export default function AuthPage() {
  return (
    <View flex={1} gap="$6" justify="center" items="center" bg="$background">
      <Slot />
    </View>
  );
}
