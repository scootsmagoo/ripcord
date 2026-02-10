type WindowRecord = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, WindowRecord>();

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || now >= current.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAt - now) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  current.count += 1;
  windows.set(key, current);

  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearRateLimitKey(key: string) {
  windows.delete(key);
}
