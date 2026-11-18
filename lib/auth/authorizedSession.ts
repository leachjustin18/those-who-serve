import type { Session } from "next-auth";
import { isEmailAuthorized } from "@/lib/auth/authorization";
import { getUserSession } from "@/lib/nextAuth/session";

export async function getAuthorizedSession(): Promise<Session | null> {
  const session = await getUserSession();
  const email = session?.user?.email;

  if (!email || !(await isEmailAuthorized(email))) return null;
  return session;
}
