import { Slot } from "expo-router";
import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { RoomProvider } from "@/providers/room-provider";

export default function Game() {
  return (
    <RoomProvider>
      <ActionSheetProvider useCustomActionSheet>
        <Slot />
      </ActionSheetProvider>
    </RoomProvider>
  );
}
