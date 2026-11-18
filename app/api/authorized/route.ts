import { NextResponse } from "next/server";
import { getAuthorizedSession } from "@/lib/auth/authorizedSession";

/**
 * GET /api/authorized
 * Confirms that the current authenticated user is still on the allowlist.
 * The allowlist itself is never returned by this endpoint.
 */
export async function GET() {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ authorized: true });
}
