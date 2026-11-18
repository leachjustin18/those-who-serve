import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import Google from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestore } from "@/lib/firebase/admin";

const authHost = process.env.SERVER_HOST;

async function isEmailAuthorized(email: string): Promise<boolean> {
  if (!authHost) {
    console.error(
      "Authorization check failed: SERVER_HOST or NEXTAUTH_URL not set",
    );
    return false;
  }

  try {
    const res = await fetch(
      `${authHost}/api/authorized?email=${encodeURIComponent(email)}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      console.error(`Authorization API responded with ${res.status}`);
      return false;
    }

    const data = (await res.json()) as { authorized?: boolean };
    return !!data.authorized;
  } catch (err) {
    console.error("Authorization API call failed", err);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
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
    async signIn({ user }: { user: User }) {
      const email = user?.email?.toLowerCase() ?? "";
      if (!email) return false;

      const isAllowed = await isEmailAuthorized(email);
      if (!isAllowed) {
        return "/auth/not-authorized";
      }

      return true;
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
