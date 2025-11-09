"use server";

import type { ReactNode } from "react";

import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/nextAuth/session";
import { CacheProvider } from "@/components/context/Cache";
import { SessionCache } from "@/lib/helpers/Cache";
import { fetchMen } from "@/lib/api/men/server";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { Man } from "@/types/man";
import { Container } from "@mui/material";

type LayoutProps = {
  children: ReactNode;
};

export default async function SecureLayout({ children }: LayoutProps) {
  const session = await getUserSession();
  const cache = new SessionCache();

  if (!cache.get("men")) {
    try {
      const fetchedMen = await fetchMen();
      cache.set("men", fetchedMen);
    } catch (err) {
      console.log("error", err);
    }
  }

  if (!session?.user) {
    redirect("/login");
  }

  const menCache = cache.get("men") as Man[];

  return (
    <CacheProvider initialCache={{ men: menCache }}>
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
