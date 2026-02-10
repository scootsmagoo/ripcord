import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidCsrf } from "@/lib/csrf.server";
import {
  checkRateLimit,
  clearRateLimitKey,
  getClientIp,
} from "@/lib/rate-limit.server";
import { setSession } from "@/lib/session.server";
import { SpacebarApiError, spacebarRequest } from "@/lib/spacebar/client.server";
import {
  SpacebarLoginRequestSchema,
  SpacebarLoginResponseSchema,
} from "@/lib/spacebar/schemas";

const RequestSchema = z.object({
  login: SpacebarLoginRequestSchema.shape.login,
  password: SpacebarLoginRequestSchema.shape.password,
});

export async function POST(request: Request) {
  if (!isValidCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const ipAddress = getClientIp(request);
  const rateLimitKey = `auth:login:${ipAddress}`;
  const rateLimit = checkRateLimit(rateLimitKey, 7, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again shortly." },
      {
        status: 429,
        headers: { "retry-after": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const payload = RequestSchema.parse(await request.json());
    const loginResult = await spacebarRequest<unknown>("/api/v9/auth/login", {
      method: "POST",
      body: payload,
    });
    const parsed = SpacebarLoginResponseSchema.parse(loginResult);

    await setSession(parsed.token, parsed.user_id);
    clearRateLimitKey(rateLimitKey);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid login payload.", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof SpacebarApiError) {
      const status = error.status >= 400 && error.status < 500 ? 401 : 502;
      return NextResponse.json(
        { error: status === 401 ? "Invalid credentials." : error.message },
        { status },
      );
    }

    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
