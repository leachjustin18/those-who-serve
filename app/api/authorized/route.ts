import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

/**
 * GET /api/authorized
 * Optional query param: ?email=foo@bar.com
 *
 * Aggregates emails from all documents in the "authorized" collection.
 * If an email is provided, returns { authorized: boolean }.
 * Otherwise returns the full normalized email list.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const emailQuery = searchParams.get("email")?.toLowerCase();

  const snapshot = await db.collection("authorized").get();

  const authorizedUsers = snapshot.docs.map((doc) => ({ ...doc.data() }));

  const allowed = new Set<string>();
  authorizedUsers.forEach((data) => {
    const email = data?.email;
    if (typeof email === "string" && email.trim()) {
      allowed.add(email.toLowerCase());
    }
  });

  console.log("allowed emails:", allowed);
  console.log("email query:", emailQuery);

  if (emailQuery) {
    return NextResponse.json({ authorized: allowed.has(emailQuery) });
  }

  return NextResponse.json({ emails: Array.from(allowed) });
}
