import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { canAccessSuperAdmin } from "@/lib/auth/roles";

export async function requireSuperAdmin() {
  const auth = await requireAdmin();
  if (!canAccessSuperAdmin(auth.role)) redirect("/admin");
  return auth;
}
