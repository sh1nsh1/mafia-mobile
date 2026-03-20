import * as z from "zod";

export type Message = z.infer<typeof messageSchema>;
export type Payload = z.infer<typeof payloadSchema>;

export const payloadSchema = z
  .object({
    actionType: z.string().optional(),
  })
  .catchall(z.any());

export const messageSchema = z.object({
  messageType: z.enum(["Command", "Event"]),
  topic: z.enum(["Lobby", "Game", "System"]),
  timestamp: z.string(),
  payload: payloadSchema,
});
