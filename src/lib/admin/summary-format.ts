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

export function rangePhrase(preset: SalesPreset) {
  if (preset === "today") return "today";
  if (preset === "30d") return "last 30 Accra days";
  if (preset === "month") return "this month";
  if (preset === "custom") return "these Accra days";
  return "last 7 Accra days";
}

export function previousCompare(preset: SalesPreset, current: number, previous: number) {
  const phrase = rangePhrase(preset);
  const change = periodChange(current, previous);
  if (previous === 0) return `No previous ${phrase} to compare`;
  if (change.direction === "up") return `Up ${change.percent}% on the previous ${phrase}`;
  if (change.direction === "down") return `Down ${change.percent}% on the previous ${phrase}`;
  return `Same as the previous ${phrase}`;
}

export function readSalesQuery(params: { range?: string; from?: string; to?: string }) {
  const preset = salesPreset(params.range);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(params.from ?? "") ? params.from : undefined;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(params.to ?? "") ? params.to : undefined;
  return { preset, from, to };
}
