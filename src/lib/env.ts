function optional(name: string) {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  siteUrl: optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  supabaseUrl: optional("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY"),
  paystackPublicKey: optional("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"),
  paystackSecretKey: optional("PAYSTACK_SECRET_KEY"),
  paystackWebhookSecret: optional("PAYSTACK_WEBHOOK_SECRET"),
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
