import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";

const menCollection = db.collection("men");

type PatchContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: PatchContext) {
  const { id } = await context.params;
  const data = await req.json();

  const ref = await menCollection.doc(id);
  await ref.update(data);
  return NextResponse.json({ success: true });
}
