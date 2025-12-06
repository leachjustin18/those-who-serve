import type { Metadata, Viewport } from "next";
import ThemeRegistry from "@/components/theme/ThemeRegistry";
import { roboto } from "@/lib/theme/fonts";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Those Who Serve - 39th St Church of Christ",
  description: "Track and plan out men to serve in the congergation",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#cff1d6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
