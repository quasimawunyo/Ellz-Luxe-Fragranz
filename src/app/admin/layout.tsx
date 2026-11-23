import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/admin-shell";
import { countInboxMessages } from "@/lib/admin/inbox";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name?.trim() || auth.email || "Shop desk";
  const inboxCount = await countInboxMessages();

  return (
    <AdminShell name={name} email={auth.email} inboxCount={inboxCount} showActivity={isSuperAdminRole(auth.role)}>
      {children}
    </AdminShell>
  );
}
