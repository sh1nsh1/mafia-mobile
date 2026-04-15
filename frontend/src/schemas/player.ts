import * as z from "zod";
import { userSchema } from "./user";

export type Player = z.infer<typeof playerSchema>;

export const playerSchema = z.object({ user: userSchema }).catchall(z.any());
