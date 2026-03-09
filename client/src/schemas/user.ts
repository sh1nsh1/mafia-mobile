import * as z from "zod";

export type User = z.infer<typeof userSchema>;

export const userSchema = z.object({
  email: z.string(),
  username: z.string(),
});
