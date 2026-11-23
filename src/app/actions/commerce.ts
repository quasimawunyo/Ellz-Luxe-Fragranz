"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validationState, type FormState } from "@/lib/forms/errors";
import { contactSchema, newsletterSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";
import { guardForm } from "@/lib/spam";

function clientKey(prefix: string, extra: string) {
  return `${prefix}:${extra}`;
}

function hourlyLimit(prefix: string, ip: string, email: string) {
  const address = email.trim().toLowerCase();
  const windowMs = 60 * 60 * 1000;
  if (!rateLimit(clientKey(`${prefix}:ip`, ip), 3, windowMs).ok) return false;
  if (!rateLimit(clientKey(`${prefix}:email`, address), 3, windowMs).ok) return false;
  return true;
}

export async function subscribeNewsletter(_prev: FormState | null, formData: FormData): Promise<FormState> {
  const guard = guardForm(formData);
  if ("drop" in guard) return { ok: true as const, message: "Thank you. You are on the list." };
  if ("error" in guard) return { error: guard.error };
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return validationState(parsed.error);
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!hourlyLimit("news", ip, parsed.data.email)) {
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

export async function submitContact(_prev: FormState | null, formData: FormData): Promise<FormState> {
  const message = String(formData.get("message") ?? "");
  const guard = guardForm(formData, message);
  if ("drop" in guard) {
    return { ok: true as const, message: "Message received. We will reply to the address you provided." };
  }
  if ("error" in guard) return { error: guard.error };
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message,
  });
  if (!parsed.success) return validationState(parsed.error);
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!hourlyLimit("contact", ip, parsed.data.email)) {
    return { error: "Please wait before sending another message." };
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
