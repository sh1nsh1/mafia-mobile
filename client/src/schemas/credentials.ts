import * as z from "zod";

export type Credentials = z.infer<typeof credentialsSchema>;

export const credentialsSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
