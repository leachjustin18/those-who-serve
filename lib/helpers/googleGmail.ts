// lib/googleGmail.ts
import { google } from "googleapis";
import { db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { isValidEmail } from "@/lib/helpers/validateFields";

const clientId = process.env.AUTH_GOOGLE_ID!;
const clientSecret = process.env.AUTH_GOOGLE_SECRET!;
const gmailSender = process.env.GMAIL_SENDER!;

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const GMAIL_SCOPES = ["openid", "email", GMAIL_SEND_SCOPE];

export function createOAuth2Client(redirectUri?: string) {
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Firestore document locations
const REFRESH_TOKENS_COLLECTION = "refresh_tokens";
const GMAIL_DOC_ID = process.env.GMAIL_REFRESH_TOKEN_ID ?? "gmail";

type RefreshTokenDoc = {
    refresh_token: string;
    provider: string;
    scope?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export function hasGmailSendScope(scope: string | null | undefined) {
    return (scope ?? "").split(/\s+/).includes(GMAIL_SEND_SCOPE);
}

export async function setStoredRefreshToken(token: string, scope: string) {
    if (!hasGmailSendScope(scope)) {
        throw new Error("Google did not grant the required gmail.send scope");
    }

    const now = Timestamp.now();
    await db.collection(REFRESH_TOKENS_COLLECTION).doc(GMAIL_DOC_ID).set(
        {
            refresh_token: token,
            provider: "google",
            scope,
            updatedAt: now,
            createdAt: now,
        },
        { merge: true },
    );
}

export async function getStoredRefreshToken(): Promise<string | null> {
    // Only use the dedicated token created by the Gmail consent flow. Normal
    // Google sign-in tokens may not include gmail.send and must never be used.
    const doc = await db
        .collection(REFRESH_TOKENS_COLLECTION)
        .doc(GMAIL_DOC_ID)
        .get();

    if (doc.exists) {
        const data = doc.data() as RefreshTokenDoc | undefined;
        if (data?.refresh_token && hasGmailSendScope(data.scope)) {
            return data.refresh_token;
        }
    }

    return null;
}

// Build raw RFC 5322 message and send via Gmail API
export async function sendGmailBatch({
    to,
    subject,
    text,
    html,
    concurrency = 3,
    retryTransient = true,
}: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    concurrency?: number;
    retryTransient?: boolean;
}) {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
        console.error("Gmail send failed: no dedicated refresh token found in refresh_tokens collection.");
        throw new Error("No stored refresh token for Gmail");
    }

    const oAuth2Client = createOAuth2Client();
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Normalize recipients
    const toList = ([] as string[]).concat(Array.isArray(to) ? to : [to]);
    const normalized = Array.from(new Set(
        toList.map((t) => (t ?? "").toString().trim()).filter((t) => t.length > 0),
    ));

    const successes: string[] = [];
    const failures: Array<{ to: string | null; reason: string; details?: string }> = [];

    // Validate and collect immediate failures
    const validRecipients: string[] = [];
    for (const addr of normalized) {
        if (!addr) {
            failures.push({ to: null, reason: "missing_email" });
            continue;
        }
        if (!isValidEmail(addr)) {
            failures.push({ to: addr, reason: "invalid_format" });
            continue;
        }
        validRecipients.push(addr);
    }

    // Build raw message for a single recipient
    function buildRawMessage(toAddr: string) {
        let message = "";
        message += `From: "Congregation Schedule" <${gmailSender}>\r\n`;
        message += `To: ${toAddr}\r\n`;
        message += `Subject: ${subject}\r\n`;
        message += `MIME-Version: 1.0\r\n`;
        if (html) {
            message += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
            message += html;
        } else {
            message += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
            message += text ?? "";
        }
        return message;
    }

    function encodeMessage(message: string) {
        return Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    // Helper to send a single message with optional retry for transient errors
    async function sendSingle(addr: string) {
        const raw = encodeMessage(buildRawMessage(addr));

        const attemptSend = async () => {
            try {
                await gmail.users.messages.send({
                    userId: "me",
                    requestBody: { raw },
                });
                return { ok: true };
            } catch (err: any) {
                return { ok: false, err };
            }
        };

        // first attempt
        let res = await attemptSend();

        // classify error
        if (res.ok) return { ok: true };

        const classify = (error: any) => {
            const status = error?.response?.status;
            const body = error?.response?.data ?? error?.message ?? "";
            const isTransient = status === 429 || (typeof status === "number" && status >= 500) || !status;
            const isPermanent = typeof status === "number" && status >= 400 && status < 500 && status !== 429;
            return { isTransient, isPermanent, status, body };
        };

        const { isTransient, isPermanent, body } = classify(res.err);

        if (isTransient && retryTransient) {
            // one retry with small backoff
            await new Promise((r) => setTimeout(r, 500 + Math.floor(Math.random() * 500)));
            res = await attemptSend();
            if (res.ok) return { ok: true };
            const { body: body2 } = classify(res.err);
            return { ok: false, permanent: false, details: body2 ?? String(res.err) };
        }

        // permanent rejection or we are not retrying
        return { ok: false, permanent: isPermanent, details: body ?? String(res.err) };
    }

    // Process recipients in batches limited by concurrency
    for (let i = 0; i < validRecipients.length; i += concurrency) {
        const batch = validRecipients.slice(i, i + concurrency);
        const promises = batch.map((addr) => sendSingle(addr));
        const results = await Promise.all(promises);

        for (let j = 0; j < results.length; j++) {
            const addr = batch[j];
            const r = results[j];
            if (r.ok) {
                successes.push(addr);
            } else {
                const reason = r.permanent ? "rejected" : "transient_error";
                failures.push({ to: addr, reason, details: r.details ?? "" });
            }
        }
    }

    return { successes, failures };
}
