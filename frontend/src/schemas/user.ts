import * as z from "zod";

export type User = z.infer<typeof userSchema>;

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
});
