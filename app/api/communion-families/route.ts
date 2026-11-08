import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import type { TCommunionFamily } from "@/types";

const collection = db.collection("communion_families");

export async function GET() {
  const snapshot = await collection.get();
  const families = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(families as TCommunionFamily[], {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { familyName?: string };
  const familyName = body.familyName?.trim();
  if (!familyName) {
    return NextResponse.json({ error: "familyName is required" }, { status: 400 });
  }
  const timestamp = Date.now();
  const data = { familyName, createdAt: timestamp, updatedAt: timestamp };
  const document = await collection.add(data);
  return NextResponse.json({ id: document.id, ...data }, { status: 201 });
}
