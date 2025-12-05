import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const DEFAULT_REDIRECT = "/manage-men";

export default withAuth(
  function middleware(req) {
    // If a signed-in user hits the login page, push them to the app.
    if (req.nextUrl.pathname === "/login" && req.nextauth?.token) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      // Allow unauthenticated access to the login page, require auth elsewhere.
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/login") return true;
        return !!token;
      },
    },
  },
);

// Apply auth to protected app routes and also watch /login for the redirect helper above.
export const config = {
  matcher: [
    "/manage-men/:path*",
    "/calendar/:path*",
    "/login",
  ],
};
