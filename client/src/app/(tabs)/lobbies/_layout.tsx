import { Stack } from "expo-router";

export default function LobbiesListLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_left",
        headerShown: false,
      }}
    />
  );
}
