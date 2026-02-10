import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env.server";

const CSRF_COOKIE_SUFFIX = ".csrf";
const CSRF_TOKEN_BYTES = 32;
const CSRF_MAX_AGE_SECONDS = 60 * 60 * 6;

function getCsrfCookieName(): string {
  return `${env.SESSION_COOKIE_NAME}${CSRF_COOKIE_SUFFIX}`;
}

function getCookieValue(
  cookieHeader: string | null,
  targetName: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const cookie = part.trim();
    if (!cookie) {
      continue;
    }

    const index = cookie.indexOf("=");
    if (index <= 0) {
      continue;
    }

    const key = cookie.slice(0, index).trim();
    if (key === targetName) {
      return decodeURIComponent(cookie.slice(index + 1).trim());
    }
  }

  return null;
}

export async function issueCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = randomBytes(CSRF_TOKEN_BYTES).toString("base64url");

  cookieStore.set(getCsrfCookieName(), token, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_MAX_AGE_SECONDS,
  });

  return token;
}

export async function clearCsrfToken() {
  const cookieStore = await cookies();
  cookieStore.delete(getCsrfCookieName());
}

export function isValidCsrf(request: Request): boolean {
  const headerValue = request.headers.get("x-csrf-token");
  const cookieHeader = request.headers.get("cookie");
  const cookieValue = getCookieValue(cookieHeader, getCsrfCookieName());

  if (!headerValue || !cookieValue) {
    return false;
  }

  const left = Buffer.from(headerValue, "utf8");
  const right = Buffer.from(cookieValue, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
