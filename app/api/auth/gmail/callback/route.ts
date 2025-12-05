// app/api/auth/gmail/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    createOAuth2Client,
    setStoredRefreshToken,
} from "@/lib/helpers/googleGmail";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return new NextResponse("Missing code", { status: 400 });
    }

    const oAuth2Client = createOAuth2Client();

    try {
        const { tokens } = await oAuth2Client.getToken(code);

        if (!tokens.refresh_token) {
            console.error("No refresh token returned from Google");
            return new NextResponse("No refresh token, try again with prompt=consent", {
                status: 500,
            });
        }

        // Store in Firestore for reuse across deploys
        await setStoredRefreshToken(tokens.refresh_token);

        // Redirect to a nice page
        return NextResponse.redirect("/gmail-connected");
    } catch (err) {
        console.error("Error exchanging auth code for tokens:", err);
        return new NextResponse("Auth error", { status: 500 });
    }
}
