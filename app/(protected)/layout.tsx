"use server";

import type { ReactNode } from "react";

import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/nextAuth/session";
import { CacheProvider } from "@/components/context/Cache";
import { fetchMen } from "@/lib/api/men";
import { AppHeader, BottomNavigation } from "@/components/ui";
import type { TMan } from "@/types";
import { Container } from "@mui/material";

type LayoutProps = {
  children: ReactNode;
};

export default async function SecureLayout({ children }: LayoutProps) {
  const session = await getUserSession();

  if (!session?.user) {
    redirect("/login");
  }

  let menCache: TMan[] = [];
  try {
    menCache = await fetchMen();
  } catch (err) {
    console.log("error", err);
  }

  return (
    <CacheProvider initialMen={menCache}>
      <AppHeader
        userName={session.user?.name}
        userImage={session.user?.image}
      />
      <Container
        style={{ paddingTop: "120px", paddingBottom: "120px" }}
        component="main"
      >
        {children}
        <BottomNavigation />
      </Container>
    </CacheProvider>
  );
}
