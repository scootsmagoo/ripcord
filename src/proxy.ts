import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function hasCrossSiteOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost !== request.nextUrl.host;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  if (MUTATING_METHODS.has(request.method) && hasCrossSiteOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-site request blocked." },
      { status: 403 },
    );
  }

  const response = NextResponse.next();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
