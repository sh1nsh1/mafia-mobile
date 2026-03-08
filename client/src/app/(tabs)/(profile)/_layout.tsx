import "@tamagui/native/setup-zeego";

import { Stack } from "expo-router";
import { View } from "tamagui";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_left",
        header: () => <CustomHeader />,
      }}
    />
  );
}

function CustomHeader() {
  return <View background="$background">Header</View>;
}
