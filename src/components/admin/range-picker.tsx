import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SalesPreset } from "@/lib/admin/summary-format";

const RANGES = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["month", "This month"],
  ["custom", "Custom"],
] as const;

export function RangePicker({
  base,
  preset,
  from,
  to,
}: {
  base: string;
  preset: SalesPreset;
  from?: string;
  to?: string;
}) {
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {RANGES.map(([id, label]) => {
          const href = id === "7d" ? base : `${base}?range=${id}`;
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm",
                preset === id ? "bg-espresso text-ivory" : "border border-espresso/10 bg-white",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
      {preset === "custom" ? (
        <form className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end" method="get" action={base}>
          <input type="hidden" name="range" value="custom" />
          <label className="text-sm text-taupe">
            From
            <input name="from" type="date" defaultValue={from} className="mt-1 block h-11 w-full border border-espresso/15 bg-white px-3" />
          </label>
          <label className="text-sm text-taupe">
            To
            <input name="to" type="date" defaultValue={to} className="mt-1 block h-11 w-full border border-espresso/15 bg-white px-3" />
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-espresso px-5 text-sm text-ivory">
            Apply
          </button>
        </form>
      ) : null}
    </div>
  );
}
