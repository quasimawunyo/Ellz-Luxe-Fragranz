import { Header } from "@/components/layout/header";
import { getAuthContext } from "@/lib/auth/session";
import { resolveCart } from "@/lib/cart/store";

export async function HeaderSession() {
  try {
    const [cart, auth] = await Promise.all([resolveCart(), getAuthContext()]);
    return <Header cartCount={cart.itemCount} signedIn={Boolean(auth.user)} />;
  } catch {
    return <Header cartCount={0} signedIn={false} />;
  }
}
