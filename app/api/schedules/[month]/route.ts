import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import type { TSchedule, TScheduleEntry } from "@/types";

const schedulesCollection = db.collection("schedules");

/**
 * GET /api/schedules/:month
 * Retrieves a specific schedule by month (YYYY-MM format).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ month: string }> },
) {
  const { month } = await params;

  const doc = await schedulesCollection.doc(month).get();

  if (!doc.exists) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      id: doc.id,
      ...doc.data(),
    } as TSchedule,
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * PUT /api/schedules/:month
 * Updates entries in an existing schedule.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ month: string }> },
) {
  const { month } = await params;
  const data = await req.json();

  const docRef = schedulesCollection.doc(month);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 },
    );
  }

  const updates = {
    entries: data.entries ?? doc.data()?.entries ?? [],
    finalized: data.finalized ?? doc.data()?.finalized ?? false,
    updatedAt: Date.now(),
  };

  await docRef.update(updates);

  const updatedDoc = await docRef.get();

  return NextResponse.json(
    {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as TSchedule,
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * DELETE /api/schedules/:month
 * Deletes a schedule document.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ month: string }> },
) {
  const { month } = await params;

  await schedulesCollection.doc(month).delete();

  return NextResponse.json(
    { id: month, success: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
