import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();

  const ref = db.collection("men").doc(id);
  await ref.update(data);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const ref = db.collection("men").doc(id);
  await ref.delete();
  return NextResponse.json({ success: true });
}
