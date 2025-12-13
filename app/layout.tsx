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
  themeColor: "#f4e8d6",
};

export const metadata: Metadata = {
  title: "Those Who Serve - 39th St Church of Christ",
  description: "Track and plan out men to serve in the congergation",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
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
