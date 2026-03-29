import { RoomContext } from "@/providers/room-provider";
import { useContext } from "react";

export const useRoom = () => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("Используйте useRoomContext внутри RoomProvider");
  }

  return context;
};
