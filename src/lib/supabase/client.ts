import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";

export function createBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
}
