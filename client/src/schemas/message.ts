import * as z from "zod";

export type Message = z.infer<typeof messageSchema>;
export type Payload = z.infer<typeof payloadSchema>;

export type DefaultRole = z.infer<typeof defaultRoleSchema>;
const defaultRoles = ["Citizen", "MafiaMember"] as const;
export const defaultRoleSchema = z.enum(defaultRoles);

export type AdditionalRole = z.infer<typeof additionalRoleSchema>;
const additionalRoles = [
  "Sheriff",
  "Doctor",
  "MafiaDon",
  "Prostitute",
  "Maniac",
  "DeputySheriff",
  "Shapeshifter",
] as const;
export const additionalRoleSchema = z.enum(additionalRoles);

export type Role = z.infer<typeof roleSchema>;
const roles = [...defaultRoles, ...additionalRoles] as const;
export const roleSchema = z.enum(roles);

export const payloadSchema = z
  .object({
    actionType: z.string().optional(),
    text: z.string().optional(),
    roleSet: z.array(roleSchema).optional(),
  })
  .catchall(z.any());

export const messageSchema = z.object({
  messageType: z.enum(["Command", "Event", "UserConnect", "UserLeave"]),
  topic: z.enum(["Lobby", "Game", "System"]),
  timestamp: z.string(),
  payload: payloadSchema.optional(),
});
