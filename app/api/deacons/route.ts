import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import type { TDeacons } from "@/types";

const deaconsCollection = db.collection("deacons");

/**
 * GET /api/deacons
 * Retrieves all deacons from the database.
 */
export async function GET() {
    const snapshot = await deaconsCollection.get();
    const deacons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(deacons as TDeacons[], { headers: { "Cache-Control": "no-store" } });
}