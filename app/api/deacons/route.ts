import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import type { TDeacons } from "@/types";
import { getAuthorizedSession } from "@/lib/auth/authorizedSession";

const deaconsCollection = db.collection("deacons");

/**
 * GET /api/deacons
 * Retrieves all deacons from the database.
 */
export async function GET() {
    if (!(await getAuthorizedSession())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const snapshot = await deaconsCollection.get();
    const deacons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(deacons as TDeacons[], { headers: { "Cache-Control": "no-store" } });
}
