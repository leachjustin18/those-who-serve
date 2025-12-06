import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/nextAuth/session";

export default async function Home() {
  const session = await getUserSession();

  if (session?.user?.email) {
    redirect("/manage-men");
  } else {
    redirect("/login");
  }
}
