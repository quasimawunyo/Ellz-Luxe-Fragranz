import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name?.trim() || auth.email || "Shop desk";

  return (
    <AdminShell name={name} email={auth.email}>
      {children}
    </AdminShell>
  );
}
