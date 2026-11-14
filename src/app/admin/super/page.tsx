import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export default async function SuperAdminPage() {
  await requireSuperAdmin();
  redirect("/admin/settings/control");
}
