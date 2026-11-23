import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";

export type StaffActivity = {
  id: string;
  actorEmail: string;
  action: string;
  targetId: string;
  before: string;
  after: string;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  sizes: "Changed sizes or prices",
  price: "Changed a price",
  stock: "Adjusted stock",
  order_status: "Changed an order status",
  cancel: "Cancelled an order",
  refund: "Recorded a refund",
  payment: "Recorded a payment",
  coupon: "Changed a coupon",
  settings: "Changed settings",
  test: "Marked an order as a test",
};

export function activityLabel(action: string) {
  return ACTION_LABELS[action] ?? "Saved a change";
}

function clip(value?: string | null) {
  if (!value) return null;
  return value.replace(/\+?\d[\d\s-]{6,}\d/g, "a number").slice(0, 240);
}

export async function recordStaffActivity(entry: {
  actorId: string;
  actorEmail: string | null;
  action: string;
  targetId: string;
  before?: string | null;
  after?: string | null;
}) {
  const admin = createServiceClient();
  if (!admin) return;
  const { error } = await admin.from("staff_activity").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    action: entry.action,
    target_id: entry.targetId,
    before_text: clip(entry.before),
    after_text: clip(entry.after),
  });
  if (!error) return;
  const missing = error.code === "42P01" || error.code === "PGRST205" || /staff_activity|schema cache/i.test(error.message);
  if (!missing) return;
}

export async function listStaffActivity(query: { person?: string; action?: string; from?: string; to?: string; order?: string }) {
  const admin = createServiceClient();
  if (!admin) return [];
  let request = admin.from("staff_activity").select("id, actor_email, action, target_id, before_text, after_text, created_at").order("created_at", { ascending: false }).limit(200);
  const person = query.person?.trim();
  const action = query.action?.trim();
  const orderId = query.order?.trim();
  if (person) request = request.ilike("actor_email", `%${person}%`);
  if (action) request = request.eq("action", action);
  if (orderId) request = request.eq("target_id", orderId);
  if (query.from && /^\d{4}-\d{2}-\d{2}$/.test(query.from)) request = request.gte("created_at", `${query.from}T00:00:00+00:00`);
  if (query.to && /^\d{4}-\d{2}-\d{2}$/.test(query.to)) request = request.lte("created_at", `${query.to}T23:59:59+00:00`);
  const { data, error } = await request;
  if (error) return [];
  return (data ?? []).map((row) => ({
    id: String(row.id),
    actorEmail: String(row.actor_email ?? "Staff"),
    action: String(row.action),
    targetId: String(row.target_id ?? ""),
    before: String(row.before_text ?? ""),
    after: String(row.after_text ?? ""),
    createdAt: String(row.created_at),
  }));
}
