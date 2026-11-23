import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const metadata = { title: "Control · Shop desk" };

export default async function SuperAdminPage() {
  await requireSuperAdmin();
  redirect("/admin/settings/control");
}
