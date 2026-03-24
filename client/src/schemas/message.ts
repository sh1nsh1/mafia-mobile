import * as z from "zod";

export type Message = z.infer<typeof messageSchema>;
export type Payload = z.infer<typeof payloadSchema>;
export type Role = z.infer<typeof roleSchema>;

const roleSchema = z.enum([
  "Citizen",
  "MafiaMember",
  "Sheriff",
  "Doctor",
  "MafiaDon",
  "Prostitute",
  "Maniac",
  "DeputySheriff",
  "Shapeshifter",
]);

export const payloadSchema = z
  .object({
    actionType: z.string().optional(),
    text: z.string().optional(),
    roleSet: z.array(roleSchema).optional(),
  })
  .catchall(z.any());

export const messageSchema = z.object({
  messageType: z.enum(["Command", "Event"]),
  topic: z.enum(["Lobby", "Game", "System"]),
  timestamp: z.string(),
  payload: payloadSchema.optional(),
});
