import { db } from "@/lib/firebase/admin";

export async function isEmailAuthorized(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const snapshot = await db.collection("authorized").get();
  return snapshot.docs.some((document) => {
    const authorizedEmail = document.data()?.email;
    return (
      typeof authorizedEmail === "string" &&
      authorizedEmail.trim().toLowerCase() === normalizedEmail
    );
  });
}
