import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { countInboxMessages } from "@/lib/admin/inbox";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name?.trim() || auth.email || "Shop desk";
  const inboxCount = await countInboxMessages();

  return (
    <AdminShell name={name} email={auth.email} inboxCount={inboxCount}>
      {children}
    </AdminShell>
  );
}
