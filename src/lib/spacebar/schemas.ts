import { z } from "zod";

export const SpacebarLoginRequestSchema = z.object({
  login: z.string().min(3).max(320),
  password: z.string().min(8).max(256),
});

export const SpacebarLoginResponseSchema = z.object({
  token: z.string().min(20),
  user_id: z.string().optional(),
});

export const SpacebarGuildSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
});

export const SpacebarGuildListSchema = z.array(SpacebarGuildSchema);

export type SpacebarLoginRequest = z.infer<typeof SpacebarLoginRequestSchema>;
export type SpacebarLoginResponse = z.infer<typeof SpacebarLoginResponseSchema>;
export type SpacebarGuild = z.infer<typeof SpacebarGuildSchema>;
