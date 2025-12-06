import {
  applicationDefault,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app: App =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(),
  });

const db = getFirestore(app);

export { db };
