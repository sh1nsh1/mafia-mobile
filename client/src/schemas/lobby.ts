import * as z from "zod";

export type Lobby = z.infer<typeof lobbySchema>;

export const lobbySchema = z.object({
  name: z.string(),
  playerCount: z.number(),
  maxPlayerCount: z.number(),
  isPublic: z.boolean(),
});
