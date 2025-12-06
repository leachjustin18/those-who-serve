import { getServerSession, type NextAuthOptions } from "next-auth";
import { authOptions } from "@/auth";

export const getUserSession = () =>
  getServerSession(authOptions as NextAuthOptions);
