import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { TrustAndPay } from "@/components/layout/trust-and-pay";
import { Header } from "@/components/layout/header";
import { HeaderSession } from "@/components/layout/header-session";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getStoreSettings } from "@/lib/catalog/queries";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      <AnnouncementBar message={settings.announcement} />
      <Suspense fallback={<Header cartCount={0} signedIn={false} />}>
        <HeaderSession />
      </Suspense>
      <main className="flex-1">{children}</main>
      <TrustAndPay phone={settings.contactPhone} />
      <Footer settings={settings} />
      <WhatsAppButton phone={settings.contactPhone} />
    </>
  );
}
