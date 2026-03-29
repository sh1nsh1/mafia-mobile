import * as z from "zod";
import { userSchema } from "./user";

export type Lobby = z.infer<typeof lobbySchema>;

export const lobbySchema = z.object({
  status: z.enum(["OK"]),
  lobbyId: z.string(),
  adminId: z.string(),
  maxPlayers: z.number(),
  participants: z.array(userSchema),
});
