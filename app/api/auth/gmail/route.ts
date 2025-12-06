// app/api/auth/gmail/route.ts
import { NextResponse } from "next/server";
import { createOAuth2Client, GMAIL_SCOPES } from "@/lib/helpers/googleGmail";

export async function GET() {
    const oAuth2Client = createOAuth2Client();

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline", // important to get refresh token
        prompt: "consent",      // force to always return refresh token first time
        scope: GMAIL_SCOPES,
    });

    // Redirect user to Google OAuth consent page
    return NextResponse.redirect(authUrl);
}
