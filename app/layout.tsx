import type { Metadata } from "next";
import ThemeRegistry from "@/components/theme/ThemeRegistry";
import { roboto } from "@/lib/theme/fonts";

export const metadata: Metadata = { title: "MUI + Next 16" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
