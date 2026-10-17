import { Header } from "@/components/layout/header";
import type { SalePopupProduct } from "@/components/layout/sale-popup";
import { SiteChrome } from "@/components/layout/site-chrome";
import { getAuthContext } from "@/lib/auth/session";
import { resolveCart } from "@/lib/cart/store";
import { discountedVariantOffers, primaryImage } from "@/lib/catalog/helpers";
import { getDiscountedProducts, getStoreSettings } from "@/lib/catalog/queries";

function salePopupProducts(products: Awaited<ReturnType<typeof getDiscountedProducts>>): SalePopupProduct[] {
  return products.flatMap((product) => {
    const offers = discountedVariantOffers(product);
    if (offers.length === 0) return [];
    const image = primaryImage(product);
    return [
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt ?? product.name,
        offers: offers.flatMap((variant) =>
          variant.compareAtMinor == null
            ? []
            : [
                {
                  id: variant.id,
                  label: variant.label,
                  priceMinor: variant.priceMinor,
                  compareAtMinor: variant.compareAtMinor,
                },
              ],
        ),
      },
    ];
  });
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, discounted] = await Promise.all([getStoreSettings(), getDiscountedProducts()]);
  const saleProducts = salePopupProducts(discounted);
  let cartCount = 0;
  let signedIn = false;
  let isAdmin = false;
  try {
    const [cart, auth] = await Promise.all([resolveCart(), getAuthContext()]);
    cartCount = cart.itemCount;
    signedIn = Boolean(auth.user);
    isAdmin = auth.role === "admin" || auth.role === "super_admin";
  } catch {
    cartCount = 0;
    signedIn = false;
    isAdmin = false;
  }

  return (
    <SiteChrome
      settings={settings}
      saleProducts={saleProducts}
      header={<Header cartCount={cartCount} signedIn={signedIn} isAdmin={isAdmin} />}
    >
      {children}
    </SiteChrome>
  );
}
