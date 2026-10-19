import type { Metadata } from "next";
import { headers } from "next/headers";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { SiteShell } from "@/components/layout/site-shell";
import { InstallCapture } from "@/components/layout/install-capture";
import { ThemeScript } from "@/components/theme/theme-script";
import { resolveSiteUrl } from "@/lib/site-url";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
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
  appleWebApp: {
    capable: true,
    title: "EllzLuxe",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${playfair.variable} h-full`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <InstallCapture nonce={nonce} />
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-ivory text-espresso antialiased">
        <SiteShell>{children}</SiteShell>
        <Toaster />
      </body>
    </html>
  );
}
