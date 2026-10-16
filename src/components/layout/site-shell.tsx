import { Header } from "@/components/layout/header";
import { SiteChrome } from "@/components/layout/site-chrome";
import { getAuthContext } from "@/lib/auth/session";
import { resolveCart } from "@/lib/cart/store";
import { getStoreSettings } from "@/lib/catalog/queries";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
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
    <SiteChrome settings={settings} header={<Header cartCount={cartCount} signedIn={signedIn} isAdmin={isAdmin} />}>
      {children}
    </SiteChrome>
  );
}
