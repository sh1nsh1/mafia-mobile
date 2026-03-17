import * as z from "zod";

export type Lobby = z.infer<typeof lobbySchema>;

export const lobbySchema = z.object({
  status: z.enum(["OK"]),
  lobbyId: z.string(),
  adminId: z.string(),
  maxPlayers: z.number(),
  participants: z.array(z.string()),
});

// status: str;
// lobby_id: str | None;
// admin_id: UUID | None;
// max_players: int | None;
// participants: list[UUID] | None;
