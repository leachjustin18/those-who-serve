"use server";

import type { ReactNode } from "react";

import { redirect } from "next/navigation";
import { addMonths, format, parse } from "date-fns";
import { getAuthorizedSession } from "@/lib/auth/authorizedSession";
import { CacheProvider } from "@/components/context/Cache";
import { fetchMen } from "@/lib/api/men";
import { fetchDeacons } from "@/lib/api/deacons";
import { fetchSchedules } from "@/lib/api/schedules";
import { fetchCommunionFamilies } from "@/lib/api/communionFamilies";
import { AppHeader, BottomNavigation } from "@/components/ui";
import type { TMan, TSchedule, TDeacons, TCommunionFamily } from "@/types";
import { Container } from "@mui/material";

type LayoutProps = {
  children: ReactNode;
};

export default async function SecureLayout({ children }: LayoutProps) {
  const session = await getAuthorizedSession();

  if (!session?.user) {
    redirect("/login");
  }

  const todayMonthStr = format(new Date(), "yyyy-MM");

  let menCache: TMan[] = [];
  let deaconsCache: TDeacons[] = [];
  let scheduleCache: TSchedule[] = [];
  let communionFamiliesCache: TCommunionFamily[] = [];

  try {
    menCache = await fetchMen();
    deaconsCache = await fetchDeacons();
    scheduleCache = await fetchSchedules();
    communionFamiliesCache = await fetchCommunionFamilies();
  } catch (err) {
    console.log("error", err);
  }

  return (
    <CacheProvider
      initialMen={menCache}
      initialDeacons={deaconsCache}
      initialSchedules={scheduleCache}
      initialCommunionFamilies={communionFamiliesCache}
    >
      <AppHeader
        userName={session.user?.name}
        userImage={session.user?.image}
        canAuthorizeGmail={
          session.user.email?.toLowerCase() ===
          (
            process.env.GMAIL_AUTHORIZED_EMAIL ?? process.env.GMAIL_SENDER
          )?.toLowerCase()
        }
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
