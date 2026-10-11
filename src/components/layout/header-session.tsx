import { Header } from "@/components/layout/header";
import { getAuthContext } from "@/lib/auth/session";
import { resolveCart } from "@/lib/cart/store";

export async function HeaderSession() {
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
  return <Header cartCount={cartCount} signedIn={signedIn} isAdmin={isAdmin} />;
}
