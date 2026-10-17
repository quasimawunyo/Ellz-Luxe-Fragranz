"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { StoreSettings } from "@/lib/catalog/types";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { BrandGrid } from "@/components/brand/brand-grid";
import { AnnexPromises } from "@/components/layout/annex-promises";
import { TrustAndPay } from "@/components/layout/trust-and-pay";

export function SiteChrome({
  children,
  header,
  settings,
}: {
  children: ReactNode;
  header: ReactNode;
  settings: StoreSettings;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <AnnouncementBar message={settings.announcement} />
      {header}
      <main id="main" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <BrandGrid />
      <AnnexPromises phone={settings.contactPhone} />
      <TrustAndPay />
      <Footer settings={settings} />
    </>
  );
}
