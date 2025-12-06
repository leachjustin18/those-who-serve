import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Credential priority:
 * 1) GOOGLE_APPLICATION_CREDENTIALS (file path) via applicationDefault().
 * 2) FIREBASE_ADMIN_JSON (stringified service account).
 * 3) FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY env vars.
 */
const buildCredential = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  const fromJson = process.env.FIREBASE_ADMIN_JSON;
  if (fromJson) {
    const parsed = JSON.parse(fromJson);
    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    });
  }

  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
};

const app: App =
  getApps()[0] ??
  initializeApp({
    credential: buildCredential(),
  });

const db = getFirestore(app);
export { db };
