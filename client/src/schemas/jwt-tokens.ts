import * as z from "zod";

export type JwtTokens = z.infer<typeof jwtTokensSchema>;

export const jwtTokensSchema = z.object({
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
});
