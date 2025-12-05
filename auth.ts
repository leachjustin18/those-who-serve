import NextAuth, {
  type NextAuthOptions,
  type Session,
  type User,
} from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import type { JWT } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/init";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  adapter: FirestoreAdapter(firestore),
  session: { strategy: "jwt" },
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    // v4 types
    async signIn({ user }: { user: User }) {
      return true;
      // const email = user?.email?.toLowerCase() ?? null;
      // if (!email) return false;
      // const exists = await prisma.user.findUnique({ where: { email } });
      // return !!exists; // generic failure if not found
    },

    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: User;
    }): Promise<Session> {
      const id = (user as AdapterUser)?.id ?? token?.sub ?? null;
      if (session.user && id) {
        (session.user as typeof session.user & { id: string }).id = id;
      }
      return session;
    },

    async redirect({
      baseUrl,
    }: {
      url: string;
      baseUrl: string;
    }): Promise<string> {
      return `${baseUrl}/manage-men`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
