import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface AuthenticatedRequest extends NextRequest {
  nextauth?: {
    token?: unknown;
  };
}

const DEFAULT_REDIRECT = "/manage-men";

export default withAuth(
  function proxy(req: AuthenticatedRequest) {
    if (req.nextUrl.pathname === "/login" && req.nextauth?.token) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, req.url));
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/login") return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/manage-men/:path*", "/manage-communion-families/:path*", "/calendar/:path*", "/login"],
};
