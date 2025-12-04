import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import type { TSchedule } from "@/types";

const schedulesCollection = db.collection("schedules");

/**
 * GET /api/schedules
 * Retrieves all schedules from the database.
 */
export async function GET() {
  const snapshot = await schedulesCollection.get();
  const schedules = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(schedules as TSchedule[], {
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * GET /api/schedules/:month
 * Retrieves a specific schedule by month (YYYY-MM format).
 * Handled by dynamic route file at [month]/route.ts
 */

/**
 * POST /api/schedules
 * Creates a new schedule for a month with initial entries.
 */
export async function POST(req: NextRequest) {
  const data: Partial<TSchedule> = await req.json();

  if (!data.month) {
    return NextResponse.json(
      { error: "month field is required" },
      { status: 400 },
    );
  }

  const scheduleDoc = {
    month: data.month,
    entries: data.entries ?? [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await schedulesCollection.doc(data.month).set(scheduleDoc);

  return NextResponse.json(
    {
      id: data.month,
      ...scheduleDoc,
    } as TSchedule,
    { status: 201 },
  );
}
