import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getAuthorizedSession } from "@/lib/auth/authorizedSession";


const menCollection = db.collection("men");


export async function GET() {
  if (!(await getAuthorizedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snapshot = await menCollection.get();
  const men = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(men, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (!(await getAuthorizedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();

  const newDoc = await menCollection.add(data);

  return NextResponse.json({ id: newDoc?.id, ...data }, { status: 201 });
}
