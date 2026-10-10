function present(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  // Direct `process.env.NEXT_PUBLIC_*` access is required for Next.js inlining on Vercel.
  siteUrl: present(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  supabaseUrl: present(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: present(process.env.SUPABASE_SERVICE_ROLE_KEY),
  paystackPublicKey: present(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
  paystackSecretKey: present(process.env.PAYSTACK_SECRET_KEY),
  paystackWebhookSecret: present(process.env.PAYSTACK_WEBHOOK_SECRET),
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(isSupabaseConfigured() && env.supabaseServiceRoleKey);
}

export function dataMode(): "supabase" | "demonstration" {
  return isSupabaseConfigured() ? "supabase" : "demonstration";
}
