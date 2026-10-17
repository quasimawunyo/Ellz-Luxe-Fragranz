import type { Metadata } from "next";
import { connection } from "next/server";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { SiteShell } from "@/components/layout/site-shell";
import { ThemeScript } from "@/components/theme/theme-script";
import { resolveSiteUrl } from "@/lib/site-url";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    resolveSiteUrl({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
      VERCEL_URL: process.env.VERCEL_URL,
    }),
  ),
  title: {
    default: "EllzLuxe Fragranz",
    template: "%s · EllzLuxe Fragranz",
  },
  description: "Perfume boutique at Ells Luxe Annex, Pantang. Shop Lattafa, Armaf, Maison Alhambra, and more.",
  openGraph: {
    title: "EllzLuxe Fragranz",
    description: "Perfume boutique at Ells Luxe Annex, Pantang.",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${outfit.variable} ${playfair.variable} h-full`}>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-ivory text-espresso antialiased">
        <SiteShell>{children}</SiteShell>
        <Toaster />
      </body>
    </html>
  );
}
