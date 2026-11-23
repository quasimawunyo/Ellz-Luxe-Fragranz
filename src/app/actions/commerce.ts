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
    phone: formData.get("phone"),
    message,
  });
  if (!parsed.success) return validationState(parsed.error);
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!hourlyLimit("contact", ip, parsed.data.email || parsed.data.phone)) {
    return { error: "Please wait before sending another message." };
  }
  if (!isSupabaseAdminConfigured()) {
    return { error: "Your message could not be sent. Use WhatsApp instead." };
  }
  const admin = createServiceClient();
  const payload = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
  };
  let { error } = await admin!.from("contact_messages").insert(payload);
  if (error && /phone/i.test(error.message)) {
    const retry = await admin!.from("contact_messages").insert({
      name: payload.name,
      email: payload.email,
      message: payload.message,
    });
    error = retry.error;
  }
  if (error) return { error: "Could not send your message." };
  revalidatePath("/contact");
  return { ok: true as const, message: "Message received. We will reply to the phone or email you provided." };
}

export async function requireAdminOrRedirect() {
  redirect("/login?next=/admin");
}
