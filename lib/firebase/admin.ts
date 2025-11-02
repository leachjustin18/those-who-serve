import { getApps, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app: App = getApps()[0];

const db = getFirestore(app);

export { db };
