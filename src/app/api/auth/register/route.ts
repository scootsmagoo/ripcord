import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env.server";
import { isValidCsrf } from "@/lib/csrf.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit.server";
import { setSession } from "@/lib/session.server";
import { SpacebarApiError, spacebarRequest } from "@/lib/spacebar/client.server";
import {
  SpacebarLoginRequestSchema,
  SpacebarLoginResponseSchema,
  SpacebarRegisterRequestSchema,
} from "@/lib/spacebar/schemas";

const RequestSchema = SpacebarRegisterRequestSchema;

function extractFieldError(details: unknown): string | null {
  if (!details || typeof details !== "object") {
    return null;
  }

  if ("message" in details && typeof details.message === "string") {
    return details.message;
  }

  if ("errors" in details && details.errors && typeof details.errors === "object") {
    const values = Object.values(details.errors as Record<string, unknown>);
    for (const value of values) {
      if (value && typeof value === "object" && "_errors" in value) {
        const list = (value as { _errors?: unknown })._errors;
        if (Array.isArray(list) && typeof list[0] === "string") {
          return list[0];
        }
      }
    }
  }

  return null;
}

type RegisterPayload = z.infer<typeof SpacebarRegisterRequestSchema>;

function toIsoDateString(input: string): string {
  // Force midnight UTC to avoid timezone rollovers from local parsing.
  return new Date(`${input}T00:00:00.000Z`).toISOString();
}

async function registerWithFallback(payload: RegisterPayload) {
  try {
    await spacebarRequest<unknown>("/api/v9/auth/register", {
      method: "POST",
      body: payload,
    });
    return;
  } catch (error) {
    if (!(error instanceof SpacebarApiError) || error.status !== 400) {
      throw error;
    }

    // Some instances expect a full ISO timestamp instead of YYYY-MM-DD.
    const isoVariant = {
      ...payload,
      date_of_birth: toIsoDateString(payload.date_of_birth),
    };
    await spacebarRequest<unknown>("/api/v9/auth/register", {
      method: "POST",
      body: isoVariant,
    });
  }
}

export async function POST(request: Request) {
  if (!isValidCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const ipAddress = getClientIp(request);
  const rateLimit = checkRateLimit(`auth:register:${ipAddress}`, 5, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again shortly." },
      {
        status: 429,
        headers: { "retry-after": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const payload = RequestSchema.parse(await request.json());
    await registerWithFallback(payload);

    const loginPayload = SpacebarLoginRequestSchema.parse({
      login: payload.email,
      password: payload.password,
    });
    const loginResult = await spacebarRequest<unknown>("/api/v9/auth/login", {
      method: "POST",
      body: loginPayload,
    });
    const parsedLogin = SpacebarLoginResponseSchema.parse(loginResult);
    await setSession(parsedLogin.token, parsedLogin.user_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid registration payload.", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof SpacebarApiError) {
      if (error.status >= 400 && error.status < 500) {
        const mapped =
          extractFieldError(error.details) ??
          "Could not register with those details.";

        return NextResponse.json(
          {
            error: mapped,
            ...(env.NODE_ENV !== "production" ? { debug: error.details } : {}),
          },
          { status: 400 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
