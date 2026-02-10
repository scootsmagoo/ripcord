import { NextResponse } from "next/server";
import { clearCsrfToken, isValidCsrf } from "@/lib/csrf.server";
import { clearSession } from "@/lib/session.server";

export async function POST(request: Request) {
  if (!isValidCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  await clearSession();
  await clearCsrfToken();
  return NextResponse.json({ ok: true });
}
