import * as z from "zod";
import { playerSchema } from "./player";

export type Game = z.infer<typeof gameSchema>;

export const gameSchema = z
  .object({
    players: z.array(playerSchema),
  })
  .catchall(z.any());
