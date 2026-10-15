import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { rateLimitMemory } from "@/lib/rate-limit-memory";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  if (!isSupabaseAdminConfigured()) {
    return rateLimitMemory(key, limit, windowMs);
  }
  const admin = createServiceClient();
  if (!admin) return rateLimitMemory(key, limit, windowMs);

  const now = new Date();
  const { data } = await admin
    .from("rate_limits")
    .select("hit_count, reset_at")
    .eq("bucket_key", key)
    .maybeSingle();

  if (!data || new Date(data.reset_at).getTime() < now.getTime()) {
    const resetAt = new Date(now.getTime() + windowMs).toISOString();
    await admin.from("rate_limits").upsert({
      bucket_key: key,
      hit_count: 1,
      reset_at: resetAt,
    });
    return { ok: true, remaining: limit - 1 };
  }

  if (data.hit_count >= limit) {
    return { ok: false, remaining: 0 };
  }

  await admin
    .from("rate_limits")
    .update({ hit_count: data.hit_count + 1 })
    .eq("bucket_key", key);
  return { ok: true, remaining: limit - data.hit_count - 1 };
}
