import { createUserSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/roles";

const emptyAuth = {
  user: null,
  role: null as UserRole | null,
  email: null as string | null,
  profile: null,
};

export async function getAuthContext() {
  try {
    const supabase = await createUserSupabase();
    if (!supabase) return emptyAuth;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return emptyAuth;

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
  } catch {
    return emptyAuth;
  }
}
