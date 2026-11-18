import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getAuthorizedSession } from "@/lib/auth/authorizedSession";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!(await getAuthorizedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const data = await req.json();

  const ref = db.collection("men").doc(id);
  await ref.update(data);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  if (!(await getAuthorizedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const ref = db.collection("men").doc(id);
  await ref.delete();
  return NextResponse.json({ success: true });
}
