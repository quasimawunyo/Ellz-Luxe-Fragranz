"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { StoreSettings } from "@/lib/catalog/types";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
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
      <AnnouncementBar message={settings.announcement} />
      {header}
      <main className="flex-1">{children}</main>
      <TrustAndPay phone={settings.contactPhone} />
      <Footer settings={settings} />
    </>
  );
}
