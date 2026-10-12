/** Only same-origin relative paths. Blocks protocol-relative and absolute URLs. */
export function safeInternalPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("://")) return fallback;
  if (/[\r\n]/.test(trimmed)) return fallback;
  return trimmed;
}
