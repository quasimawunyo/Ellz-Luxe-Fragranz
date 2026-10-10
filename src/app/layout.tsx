import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { SiteShell } from "@/components/layout/site-shell";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "EllzLuxe Fragranz",
    template: "%s · EllzLuxe Fragranz",
  },
  description:
    "A Ghana-based boutique for captivating fragrances — accessible luxury with the poise of a niche perfume house.",
  openGraph: {
    title: "EllzLuxe Fragranz",
    description:
      "Discover fragrances that express personality, confidence, elegance, and individuality.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${cormorant.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ivory text-espresso antialiased">
        <SiteShell>{children}</SiteShell>
        <Toaster />
      </body>
    </html>
  );
}
