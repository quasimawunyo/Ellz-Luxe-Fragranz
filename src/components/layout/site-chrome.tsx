"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { InstallPrompt } from "@/components/layout/install-prompt";

export function SiteChrome({
  children,
  header,
  extras,
}: {
  children: ReactNode;
  header: ReactNode;
  extras: ReactNode;
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
      {header}
      <main id="main" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      {extras}
      <InstallPrompt />
    </>
  );
}
