import { getServerSession, type NextAuthOptions } from "next-auth";
import { authOptions } from "@/auth";

export function getUserSession() {
  return getServerSession(authOptions as NextAuthOptions);
}
