export type SalesPreset = "today" | "7d" | "30d" | "month" | "custom";

export function salesPreset(value: string | undefined): SalesPreset {
  if (value === "today" || value === "30d" || value === "month" || value === "custom") return value;
  return "7d";
}

export function periodChange(current: number, previous: number) {
  if (previous === 0 && current === 0) return { direction: "flat" as const, percent: 0 };
  if (previous === 0) return { direction: "new" as const, percent: null };
  const percent = Math.round(((current - previous) / previous) * 1000) / 10;
  if (percent > 0) return { direction: "up" as const, percent };
  if (percent < 0) return { direction: "down" as const, percent: Math.abs(percent) };
  return { direction: "flat" as const, percent: 0 };
}

export function formatAccraDay(isoDate: string) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Accra",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatAccraRange(from: string, to: string) {
  if (!from || !to) return "";
  if (from === to) return formatAccraDay(from);
  return `${formatAccraDay(from)} – ${formatAccraDay(to)}`;
}
