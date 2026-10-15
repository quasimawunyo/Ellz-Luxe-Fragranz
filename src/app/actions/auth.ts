"use server";

import { redirect } from "next/navigation";
import { createUserSupabase } from "@/lib/supabase/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import { profileSchema, signInSchema, signUpSchema } from "@/lib/validations";
import { safeInternalPath } from "@/lib/security/paths";

export async function signInAction(_prev: { error?: string } | null, formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication requires Supabase configuration." };
  }
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  const supabase = await createUserSupabase();
  const { error } = await supabase!.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect(safeInternalPath(formData.get("next")));
}

export async function signUpAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication requires Supabase configuration." };
  }
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  const supabase = await createUserSupabase();
  const { error } = await supabase!.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${env.siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { ok: true as const, message: "Check your email to confirm your account." };
}

export async function signOutAction() {
  const supabase = await createUserSupabase();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function recoverPasswordAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication requires Supabase configuration." };
  }
  const email = String(formData.get("email") ?? "");
  const supabase = await createUserSupabase();
  const { error } = await supabase!.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.siteUrl}/auth/callback?next=/account`,
  });
  if (error) return { error: error.message };
  return { ok: true as const, message: "If that account exists, a reset email is on its way." };
}

export async function updateProfileAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createUserSupabase();
  if (!supabase) return { error: "Authentication requires Supabase configuration." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone ?? null })
    .eq("id", user.id);
  if (error) return { error: error.message };
  return { ok: true as const, message: "Profile updated." };
}
