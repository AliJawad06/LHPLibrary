import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { getToken } from "@/lib/auth-server";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Library — The Light House Project",
  description:
    "Browse and borrow from the community bookshelf of The Light House Project — seerah, tafsir, fiqh, kids, and contemporary Muslim American writing, curated for the Triangle.",
};

export const viewport: Viewport = {
  themeColor: "#1a2340",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const token = await getToken();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:wght@700&family=Public+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <ConvexClientProvider initialToken={token}>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
