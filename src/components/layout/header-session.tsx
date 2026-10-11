import { Header } from "@/components/layout/header";
import { getAuthContext } from "@/lib/auth/session";
import { resolveCart } from "@/lib/cart/store";

export async function HeaderSession() {
  let cartCount = 0;
  let signedIn = false;
  try {
    const [cart, auth] = await Promise.all([resolveCart(), getAuthContext()]);
    cartCount = cart.itemCount;
    signedIn = Boolean(auth.user);
  } catch {
    cartCount = 0;
    signedIn = false;
  }
  return <Header cartCount={cartCount} signedIn={signedIn} />;
}
