import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";

export type ContactNote = {
  id: string;
  name: string;
  email: string;
  message: string;
  isSpam: boolean;
  createdAt: string;
};

export async function listContactMessages(spam = false, limit = 40): Promise<ContactNote[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = createServiceClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from("contact_messages")
    .select("id, name, email, message, is_spam, created_at")
    .eq("is_spam", spam)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (spam) return [];
    const fallback = await admin
      .from("contact_messages")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (fallback.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      isSpam: false,
      createdAt: row.created_at,
    }));
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    isSpam: Boolean(row.is_spam),
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

export type WaitlistNote = {
  id: string;
  productId: string;
  email: string;
  createdAt: string;
};

export async function listRestockWaitlist(limit = 80): Promise<WaitlistNote[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = createServiceClient();
  if (!admin) return [];
  const { data } = await admin
    .from("restock_waitlist")
    .select("id, product_id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    email: row.email,
    createdAt: row.created_at,
  }));
}

export async function countInboxMessages() {
  if (!isSupabaseAdminConfigured()) return 0;
  const admin = createServiceClient();
  if (!admin) return 0;
  const filtered = await admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_spam", false);
  if (filtered.error) {
    const fallback = await admin.from("contact_messages").select("id", { count: "exact", head: true });
    return fallback.count ?? 0;
  }
  return filtered.count ?? 0;
}
