import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

const menCollection = db.collection("men");

export async function GET() {
  const snapshot = await menCollection.get();
  const men = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(men, { headers: { "Cache-Control": "no-store" } });
}
