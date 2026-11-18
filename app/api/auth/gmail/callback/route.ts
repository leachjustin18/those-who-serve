// app/api/auth/gmail/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    createOAuth2Client,
    hasGmailSendScope,
    setStoredRefreshToken,
} from "@/lib/helpers/googleGmail";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get("gmail_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return new NextResponse("Invalid Gmail authorization response", {
      status: 400,
    });
  }

  const redirectUri = new URL("/api/auth/gmail/callback", req.url).toString();
  const oAuth2Client = createOAuth2Client(redirectUri);

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("No refresh token returned from Google");
      return new NextResponse(
        "No refresh token, try again with prompt=consent",
        {
          status: 500,
        },
      );
    }

    // Store in Firestore for reuse across deploys
        const grantedScope = tokens.scope ?? "";
        if (!hasGmailSendScope(grantedScope)) {
            return new NextResponse("Google did not grant permission to send Gmail", {
                status: 400,
            });
        }

        if (!tokens.id_token) {
            return new NextResponse("Google did not identify the authorizing account", {
                status: 400,
            });
        }

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.AUTH_GOOGLE_ID,
        });
        const authorizedEmail = (
            process.env.GMAIL_AUTHORIZED_EMAIL ?? process.env.GMAIL_SENDER
        )?.toLowerCase();
        if (ticket.getPayload()?.email?.toLowerCase() !== authorizedEmail) {
            return new NextResponse("Authorize Gmail using the configured sender account", {
                status: 403,
            });
        }

        await setStoredRefreshToken(tokens.refresh_token, grantedScope);

    const response = NextResponse.redirect(
      new URL("/error-logs?gmail=connected", req.url),
    );
    response.cookies.set("gmail_oauth_state", "", {
      httpOnly: true,
      path: "/api/auth/gmail/callback",
      maxAge: 0,
    });
    return response;
  } catch (err) {
    console.error("Error exchanging auth code for tokens:", err);
    return new NextResponse("Auth error", { status: 500 });
  }
}
