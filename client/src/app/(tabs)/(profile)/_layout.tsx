import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Stack } from "expo-router";
import ProfileHeader from "src/components/ProfileHeader";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_left",
        header: () => <ProfileHeader />,
      }}
    />
  );
}
