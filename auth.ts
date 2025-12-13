import NextAuth, {
  type NextAuthOptions,
  type Session,
  type User,
} from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import type { JWT } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/admin";

const authHost = process.env.SERVER_HOST;

async function isEmailAuthorized(email: string): Promise<boolean> {
  if (!authHost) {
    console.error("Authorization check failed: SERVER_HOST or NEXTAUTH_URL not set");
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
    async signIn({ user }: { user: User }) {
      const email = user?.email?.toLowerCase() ?? "";
      if (!email) return false;

      const isAllowed = await isEmailAuthorized(email);
      if (!isAllowed) {
        return "/auth/not-authorized";
      }

      return true;
    },

    async jwt({ token, account, user }) {
      if (account?.refresh_token) {
        // Store in Firestore when user first signs in
        const { setStoredRefreshToken } = await import('@/lib/helpers/googleGmail');
        await setStoredRefreshToken(account.refresh_token);

        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
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
