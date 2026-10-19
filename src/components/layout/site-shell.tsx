import { Suspense } from "react";
import { PublicAnnouncement } from "@/components/layout/public-announcement";
import { AnnexPromises } from "@/components/layout/annex-promises";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SalePopup, type SalePopupProduct } from "@/components/layout/sale-popup";
import { SiteChrome } from "@/components/layout/site-chrome";
import { TrustAndPay } from "@/components/layout/trust-and-pay";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { BrandGrid } from "@/components/brand/brand-grid";
import { getAuthContext } from "@/lib/auth/session";
import { resolveCart } from "@/lib/cart/store";
import { discountedVariantOffers, primaryImage, sellingVariant } from "@/lib/catalog/helpers";
import { getDiscountedProducts, getStoreSettings } from "@/lib/catalog/queries";

function salePopupProducts(products: Awaited<ReturnType<typeof getDiscountedProducts>>): SalePopupProduct[] {
  return products.flatMap((product) => {
    const selling = sellingVariant(product);
    const offer = discountedVariantOffers(product).find((variant) => variant.id === selling?.id);
    if (!offer || offer.compareAtMinor == null) return [];
    const image = primaryImage(product);
    return [
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt ?? product.name,
        offers: [
          {
            id: offer.id,
            label: offer.label,
            priceMinor: offer.priceMinor,
            compareAtMinor: offer.compareAtMinor,
          },
        ],
      },
    ];
  });
}

async function ChromeHeader() {
  const [settings, session] = await Promise.all([
    getStoreSettings(),
    Promise.all([resolveCart(), getAuthContext()]).catch(() => null),
  ]);
  const cartCount = session?.[0].itemCount ?? 0;
  const signedIn = Boolean(session?.[1].user);
  const isAdmin = session?.[1].role === "admin" || session?.[1].role === "super_admin";

  return (
    <>
      <PublicAnnouncement location={settings.location} phone={settings.contactPhone} />
      <Header cartCount={cartCount} signedIn={signedIn} isAdmin={isAdmin} />
    </>
  );
}

async function ChromeExtras() {
  const [settings, discounted] = await Promise.all([getStoreSettings(), getDiscountedProducts()]);
  return (
    <>
      <BrandGrid />
      <AnnexPromises phone={settings.contactPhone} />
      <TrustAndPay />
      <Footer settings={settings} />
      <WhatsAppButton phone={settings.contactPhone} />
      <SalePopup products={salePopupProducts(discounted)} />
    </>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome
      header={
        <Suspense fallback={<Header cartCount={0} signedIn={false} ready={false} />}>
          <ChromeHeader />
        </Suspense>
      }
      extras={
        <Suspense fallback={null}>
          <ChromeExtras />
        </Suspense>
      }
    >
      {children}
    </SiteChrome>
  );
}
