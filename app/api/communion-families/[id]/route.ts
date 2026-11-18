import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getAuthorizedSession } from "@/lib/auth/authorizedSession";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await getAuthorizedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = await request.json();
  const updates = { ...body, updatedAt: Date.now() };
  const reference = db.collection("communion_families").doc(id);
  await reference.update(updates);
  const updated = await reference.get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await getAuthorizedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  await db.collection("communion_families").doc(id).delete();
  return NextResponse.json({ id, success: true });
}
