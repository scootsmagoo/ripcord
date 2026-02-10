import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Ripcord"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3000"),
  SESSION_COOKIE_NAME: z.string().min(1).default("ripcord.sid"),
});

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
});
