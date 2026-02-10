import { z } from "zod";

export const SpacebarLoginRequestSchema = z.object({
  login: z.string().min(3).max(320),
  password: z.string().min(8).max(256),
});

export const SpacebarRegisterRequestSchema = z.object({
  email: z.email().max(320),
  username: z
    .string()
    .min(2)
    .max(32)
    .regex(
      /^[A-Za-z0-9_.-]+$/,
      "Username may only include letters, numbers, dots, dashes, or underscores.",
    ),
  password: z.string().min(8).max(256),
  date_of_birth: z.string().date(),
  consent: z.literal(true),
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
export type SpacebarRegisterRequest = z.infer<
  typeof SpacebarRegisterRequestSchema
>;
export type SpacebarLoginResponse = z.infer<typeof SpacebarLoginResponseSchema>;
export type SpacebarGuild = z.infer<typeof SpacebarGuildSchema>;
