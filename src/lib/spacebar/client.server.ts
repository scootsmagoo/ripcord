import { env } from "@/lib/env.server";

type SpacebarRequestOptions = {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
  timeoutMs?: number;
};

export class SpacebarApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "SpacebarApiError";
    this.status = status;
  }
}

export async function spacebarRequest<T>(
  path: string,
  options: SpacebarRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 8_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.SPACEBAR_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(options.token ? { authorization: options.token } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      const message =
        typeof body === "object" &&
        body &&
        "message" in body &&
        typeof body.message === "string"
          ? body.message
          : "Spacebar request failed.";

      throw new SpacebarApiError(message, response.status);
    }

    return body as T;
  } catch (error) {
    if (error instanceof SpacebarApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new SpacebarApiError("Spacebar request timed out.", 504);
    }

    throw new SpacebarApiError("Could not reach Spacebar backend.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
