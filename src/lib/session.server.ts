import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env.server";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  token: string;
  userId?: string;
  exp: number;
};

function getKey(): Buffer {
  const normalized = env.SESSION_ENCRYPTION_KEY.replace(/-/g, "+").replace(
    /_/g,
    "/",
  );
  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const key = Buffer.from(padded, "base64");

  if (key.length !== 32) {
    throw new Error("SESSION_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }

  return key;
}

function encryptPayload(payload: SessionPayload): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decryptPayload(value: string): SessionPayload | null {
  try {
    const key = getKey();
    const raw = Buffer.from(value, "base64url");
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    const parsed = JSON.parse(decrypted) as SessionPayload;

    if (!parsed.token || typeof parsed.exp !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(token: string, userId?: string) {
  const cookieStore = await cookies();
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const value = encryptPayload({ token, userId, exp });

  cookieStore.set(env.SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const payload = decryptPayload(value);

  if (!payload || payload.exp < Date.now()) {
    cookieStore.delete(env.SESSION_COOKIE_NAME);
    return null;
  }

  return payload;
}
