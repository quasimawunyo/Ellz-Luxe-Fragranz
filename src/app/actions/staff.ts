"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { canAssignRole, isUserRole } from "@/lib/auth/roles";
import { listStaff } from "@/lib/admin/staff";

export async function updateStaffRoleAction(
  _prev: { error?: string; ok?: boolean; message?: string } | null,
  formData: FormData,
) {
  const auth = await requireSuperAdmin();
  if (!isSupabaseAdminConfigured()) {
    return { error: "Staff changes need SUPABASE_SERVICE_ROLE_KEY." };
  }
  const admin = createServiceClient();
  if (!admin) return { error: "Admin client unavailable." };

  const userId = String(formData.get("userId") ?? "");
  const nextRole = String(formData.get("role") ?? "");
  if (!userId) return { error: "Missing account." };
  if (!isUserRole(nextRole)) return { error: "Choose a valid role." };

  const staff = await listStaff();
  const target = staff.find((member) => member.id === userId);
  if (!target) return { error: "Account not found." };

  const allowed = canAssignRole({
    actorId: auth.user!.id,
    actorRole: auth.role,
    targetId: target.id,
    currentRole: target.role,
    nextRole,
    superAdminCount: staff.filter((member) => member.role === "super_admin").length,
  });
  if (!allowed.ok) return { error: allowed.error };

  const { error } = await admin
    .from("profiles")
    .update({ role: nextRole, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/super");
  revalidatePath("/admin");
  return { ok: true as const, message: "Role saved." };
}
