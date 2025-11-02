import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/nextAuth/session";

type LayoutProps = {
  children: ReactNode;
};

export default async function SecureLayout({ children }: LayoutProps) {
  const session = await getUserSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main>
      Hello, {session?.user?.name} <br />
      Email: {session?.user?.email}
      {children}
    </main>
  );
}
