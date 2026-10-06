import type { Metadata } from "next";
import type { ReactNode } from "react";
import { geist, inter } from "@/lib/fonts";
import { profile } from "@/data/profile";
import { SiteShell } from "@/components/layout/SiteShell";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — Designer & Developer`,
  description: profile.introduction,
  icons: {
    icon: { url: profile.portrait.src, type: "image/png" },
    apple: profile.portrait.src,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
