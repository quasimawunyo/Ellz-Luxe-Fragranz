const LINK = /https?:\/\/|www\./gi;

export function guardForm(formData: FormData, message?: string): { drop: true } | { error: string } | { ok: true } {
  if (String(formData.get("company_website") ?? "").trim()) return { drop: true };
  const opened = Number(formData.get("openedAt"));
  if (!Number.isFinite(opened) || Date.now() - opened < 3000) {
    return { error: "Please wait a moment and send it again." };
  }
  if (message && message.length > 2000) return { error: "Keep the message under 2000 characters." };
  const links = message?.match(LINK)?.length ?? 0;
  if (links > 1) return { error: "Send one link at most." };
  return { ok: true };
}
