import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";

type PatchContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: PatchContext) {
  const { id } = await context.params;
  const data = await req.json();

  const ref = db.collection("men").doc(id);
  await ref.update(data);
  return NextResponse.json({ success: true });
}
