import { NextResponse } from "next/server";
import { getSession } from "@/lib/session.server";
import { SpacebarApiError, spacebarRequest } from "@/lib/spacebar/client.server";
import { SpacebarGuildListSchema } from "@/lib/spacebar/schemas";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const response = await spacebarRequest<unknown>("/api/v9/users/@me/guilds", {
      token: session.token,
    });
    const guilds = SpacebarGuildListSchema.parse(response);

    return NextResponse.json({ guilds });
  } catch (error) {
    if (error instanceof SpacebarApiError) {
      const status = error.status >= 400 && error.status < 500 ? 401 : 502;
      if (status === 401) {
        return NextResponse.json(
          { error: "Session expired. Please sign in again." },
          { status },
        );
      }

      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Failed to load guilds." },
      { status: 500 },
    );
  }
}
