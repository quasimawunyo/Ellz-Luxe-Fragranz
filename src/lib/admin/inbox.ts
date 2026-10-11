import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";

export type ContactNote = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export async function listContactMessages(limit = 40): Promise<ContactNote[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = createServiceClient();
  if (!admin) return [];
  const { data } = await admin
    .from("contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export async function countNewsletterSubscribers() {
  if (!isSupabaseAdminConfigured()) return 0;
  const admin = createServiceClient();
  if (!admin) return 0;
  const { count } = await admin.from("newsletter_subscribers").select("email", { count: "exact", head: true });
  return count ?? 0;
}

export async function countContactMessages() {
  if (!isSupabaseAdminConfigured()) return 0;
  const admin = createServiceClient();
  if (!admin) return 0;
  const { count } = await admin.from("contact_messages").select("id", { count: "exact", head: true });
  return count ?? 0;
}
