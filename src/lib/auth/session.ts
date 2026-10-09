import { createUserSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/roles";

export async function getAuthContext() {
  const supabase = await createUserSupabase();
  if (!supabase) {
    return { user: null, role: null as UserRole | null, email: null as string | null, profile: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, role: null as UserRole | null, email: null as string | null, profile: null };
  }

  const admin = createServiceClient();
  const client = admin ?? supabase;
  const { data: profile } = await client
    .from("profiles")
    .select("role, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    role: (profile?.role as UserRole | undefined) ?? "customer",
    email: user.email ?? null,
    profile: profile as { full_name: string | null; phone: string | null; role: UserRole } | null,
  };
}
