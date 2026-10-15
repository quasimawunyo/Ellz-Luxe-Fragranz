"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contactSchema, newsletterSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/http/client-ip";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";

function clientKey(prefix: string, extra: string) {
  return `${prefix}:${extra}`;
}

export async function subscribeNewsletter(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!(await rateLimit(clientKey("news", ip), 5, 60_000)).ok) {
    return { error: "Please wait before submitting again." };
  }
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    const { error } = await admin!.from("newsletter_subscribers").insert({
      email: parsed.data.email.toLowerCase(),
    });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      return { error: "Could not save your subscription." };
    }
  }
  return { ok: true as const, message: "Thank you. You are on the list." };
}

export async function submitContact(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the form." };
  }
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!(await rateLimit(clientKey("contact", ip), 4, 60_000)).ok) {
    return { error: "Please wait before submitting again." };
  }
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    const { error } = await admin!.from("contact_messages").insert(parsed.data);
    if (error) return { error: "Could not send your message." };
  }
  revalidatePath("/contact");
  return {
    ok: true as const,
    message: isSupabaseAdminConfigured()
      ? "Message received. We will reply to the address you provided."
      : "Message validated. Connect Supabase to persist contact messages.",
  };
}

export async function requireAdminOrRedirect() {
  redirect("/login?next=/admin");
}
