"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";

export async function markMessageSpamAction(formData: FormData) {
  await requireAdmin();
  const admin = createServiceClient();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const spam = formData.get("spam") === "true";
  await admin.from("contact_messages").update({ is_spam: spam }).eq("id", id);
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}
