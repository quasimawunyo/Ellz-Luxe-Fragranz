import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import { isUserRole, type UserRole } from "@/lib/auth/roles";

export type StaffMember = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

export async function listStaff(): Promise<StaffMember[]> {
  const admin = createServiceClient();
  if (!admin) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: true });

  const emails = new Map<string, string | undefined>();
  const listed = await admin.auth.admin.listUsers({ perPage: 1000 });
  for (const user of listed.data?.users ?? []) {
    emails.set(user.id, user.email);
  }

  return (profiles ?? []).flatMap((profile) => {
    if (!isUserRole(profile.role)) return [];
    return [
      {
        id: profile.id,
        email: emails.get(profile.id) ?? null,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        createdAt: profile.created_at,
      },
    ];
  });
}
