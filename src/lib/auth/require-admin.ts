import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/auth/roles";

export async function requireAdmin() {
  const auth = await getAuthContext();
  if (!auth.user) redirect("/login?next=/admin");
  if (!canAccessAdmin(auth.role)) redirect("/");
  return auth;
}
