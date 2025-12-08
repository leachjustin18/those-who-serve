// lib/googleGmail.ts
import { google } from "googleapis";
import { db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const clientId = process.env.AUTH_GOOGLE_ID!;
const clientSecret = process.env.AUTH_GOOGLE_SECRET!;
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
const gmailSender = process.env.GMAIL_SENDER!;

// Scope: send email
export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

export function createOAuth2Client() {
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Firestore document locations
const REFRESH_TOKENS_COLLECTION = "refresh_tokens";
const GMAIL_DOC_ID = process.env.GMAIL_REFRESH_TOKEN_ID ?? "gmail";

type RefreshTokenDoc = {
    refresh_token: string;
    provider: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

type AccountDoc = {
    provider?: string;
    refresh_token?: string;
    expires_at?: number;
};

export async function setStoredRefreshToken(token: string) {
    const now = Timestamp.now();
    await db
        .collection(REFRESH_TOKENS_COLLECTION)
        .doc(GMAIL_DOC_ID)
        .set(
            {
                refresh_token: token,
                provider: "google",
                updatedAt: now,
                createdAt: now,
            },
            { merge: true },
        );
}

async function getRefreshTokenFromAccounts(): Promise<string | null> {
    const snapshot = await db
        .collection("accounts")
        .where("provider", "==", "google")
        .get();

    for (const doc of snapshot.docs) {
        const data = doc.data() as AccountDoc;
        if (data.refresh_token) {
            return data.refresh_token;
        }
    }

    return null;
}

export async function getStoredRefreshToken(): Promise<string | null> {
    // Prefer the dedicated refresh_tokens/{id} doc created via the Gmail consent flow.
    const doc = await db
        .collection(REFRESH_TOKENS_COLLECTION)
        .doc(GMAIL_DOC_ID)
        .get();

    if (doc.exists) {
        const data = doc.data() as RefreshTokenDoc | undefined;
        if (data?.refresh_token) return data.refresh_token;
    }

    // NextAuth account refresh tokens might lack the gmail.send scope if they were
    // issued before we requested it, so treat them as a fallback only.
    const accountToken = await getRefreshTokenFromAccounts();
    if (accountToken) return accountToken;

    // Last resort: grab the newest doc in refresh_tokens collection
    const fallbackSnapshot = await db
        .collection(REFRESH_TOKENS_COLLECTION)
        .orderBy("updatedAt", "desc")
        .limit(1)
        .get();

    const fallbackDoc = fallbackSnapshot.docs[0];
    if (fallbackDoc) {
        const data = fallbackDoc.data() as RefreshTokenDoc | undefined;
        if (data?.refresh_token) return data.refresh_token;
    }

    return null;
}

// Build raw RFC 5322 message and send via Gmail API
export async function sendGmail({
    to,
    subject,
    text,
    html,
}: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}) {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
        console.error("Gmail send failed: no refresh token found. Checked accounts and refresh_tokens collection.");
        throw new Error("No stored refresh token for Gmail");
    }

    const oAuth2Client = createOAuth2Client();
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const toHeader = Array.isArray(to) ? to.join(", ") : to;

    // Basic MIME message
    let message = "";
    message += `From: "Congregation Schedule" <${gmailSender}>\r\n`;
    message += `To: ${toHeader}\r\n`;
    message += `Subject: ${subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    if (html) {
        // multipart alternative (text + html) is nicer, but this is enough
        message += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
        message += html;
    } else {
        message += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
        message += text ?? "";
    }

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    try {
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (err: any) {
        // Surface more detail to aid debugging (e.g., unauthorized_client vs insufficient_scope)
        const reason =
            err?.response?.data ||
            err?.errors ||
            err?.message ||
            "Unknown Gmail API error";
        throw new Error(
            `Gmail send failed: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`,
        );
    }
}
