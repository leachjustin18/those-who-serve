// app/api/auth/gmail/route.ts
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createOAuth2Client, GMAIL_SCOPES } from "@/lib/helpers/googleGmail";
import { getUserSession } from "@/lib/nextAuth/session";

export async function GET() {
  const session = await getUserSession();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const authorizedEmail = (
    process.env.GMAIL_AUTHORIZED_EMAIL ?? process.env.GMAIL_SENDER
  )?.toLowerCase();
  if (
    !authorizedEmail ||
    session.user.email.toLowerCase() !== authorizedEmail
  ) {
    return new NextResponse(
      "Only the configured Gmail sender can authorize email delivery",
      {
        status: 403,
      },
    );
  }

  const oAuth2Client = createOAuth2Client();
  const state = randomBytes(32).toString("hex");

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // important to get refresh token
    prompt: "consent select_account",
    include_granted_scopes: true,
    login_hint: authorizedEmail,
    scope: GMAIL_SCOPES,
    state,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/gmail/callback",
    maxAge: 10 * 60,
  });
  return response;
}
