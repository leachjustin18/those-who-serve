import {
  getApps,
  initializeApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app: App =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.AUTH_FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });

const db = getFirestore(app);
const firestore = db;

export { db, firestore };