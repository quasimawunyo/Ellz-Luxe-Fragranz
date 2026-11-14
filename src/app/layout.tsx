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
  preload: false,
});

const homeDescription = "Perfume boutique at Ells Luxe Annex, Pantang. Shop Lattafa, Armaf, Fragrance World, Rasasi, and the other houses on the shelf.";

export const metadata: Metadata = {
  description: homeDescription,
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
  openGraph: {
    title: "EllzLuxe Fragranz",
    description: homeDescription,
    type: "website",
    images: [{ url: "/images/story.jpg", alt: "Perfume bottles at EllzLuxe Fragranz" }],
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
        <ThemeScript nonce={nonce} />
      </head>
      <body className="flex min-h-full flex-col bg-ivory text-espresso antialiased">
        <SiteShell>{children}</SiteShell>
        <Toaster />
      </body>
    </html>
  );
}
