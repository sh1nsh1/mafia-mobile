import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_left",
        headerShown: false,
      }}
    />
  );
}
