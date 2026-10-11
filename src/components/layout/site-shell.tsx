import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { HeaderSession } from "@/components/layout/header-session";
import { SiteChrome } from "@/components/layout/site-chrome";
import { getStoreSettings } from "@/lib/catalog/queries";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <SiteChrome
      settings={settings}
      header={
        <Suspense fallback={<Header cartCount={0} signedIn={false} ready={false} />}>
          <HeaderSession />
        </Suspense>
      }
    >
      {children}
    </SiteChrome>
  );
}
