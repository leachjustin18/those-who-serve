import { db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const ERROR_LOGS_COLLECTION = "error_logs";

export type ErrorLogEntry = {
  to?: string | null;
  errorType: string; // e.g., 'email_failure'
  reason: string;
  details?: string;
  subject?: string;
  context?: Record<string, any>;
  createdAt?: Timestamp;
};

export async function recordErrorLogs(
  entries: Array<Partial<ErrorLogEntry>>,
  context?: Record<string, any>,
) {
  if (!Array.isArray(entries) || entries.length === 0) return;

  const batch = db.batch();
  const now = Timestamp.now();

  for (const entry of entries) {
    const docRef = db.collection(ERROR_LOGS_COLLECTION).doc();
    batch.set(docRef, {
      to: entry.to ?? null,
      errorType: entry.errorType ?? "email_failure",
      reason: entry.reason ?? "unknown",
      details: entry.details ?? null,
      subject: entry.subject ?? null,
      context: { ...(entry.context ?? {}), ...(context ?? {}) },
      createdAt: now,
    });
  }

  await batch.commit();
}

export default recordErrorLogs;
