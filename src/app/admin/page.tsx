import Link from "next/link";
import { loadSalesSummary } from "@/lib/admin/summary";
import { formatMoney } from "@/lib/money";
import { previousCompare, rangePhrase, readSalesQuery } from "@/lib/admin/summary-format";
import { RangePicker } from "@/components/admin/range-picker";
import { cn } from "@/lib/utils";

export const metadata = { title: "Home · Shop desk" };

function money(amountMinor: number) {
  if (amountMinor < 0) return `−${formatMoney(Math.abs(amountMinor))}`;
  return formatMoney(amountMinor);
}

function accraToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Accra", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function dayBits(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return {
    letter: new Intl.DateTimeFormat("en-GH", { weekday: "narrow", timeZone: "Africa/Accra" }).format(date),
    number: new Intl.DateTimeFormat("en-GH", { day: "numeric", timeZone: "Africa/Accra" }).format(date),
  };
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const query = readSalesQuery(await searchParams);
  const summary = await loadSalesSummary(query.preset, query.from, query.to);
  const phrase = rangePhrase(summary.range.preset);
  const today = accraToday();
  const peak = Math.max(1, ...summary.days.map((day) => day.revenueMinor));
  const actions = [
    ["Waiting to be packed", summary.action.toPack, "/admin/pack"],
    ["Waiting for a delivery fee", summary.action.needsFee, "/admin/orders?view=all&fee=missing"],
    ["Out for delivery", summary.action.outForDelivery, "/admin/orders?view=all&fulfilment=out_for_delivery"],
    ["Needs attention", summary.action.needsAttention, "/admin/orders?view=all&attention=1"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Desk</h1>
          <p className="mt-2 max-w-md text-sm text-taupe">What is moving, and the orders still waiting on you.</p>
        </div>
        <Link href="/admin/orders?view=all" className="inline-flex min-h-11 items-center rounded-xl border border-espresso/15 bg-white px-4 text-sm">
          All orders
        </Link>
      </header>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">Paid revenue</p>
            <p className="mt-2 font-serif text-4xl">{money(summary.current.revenueMinor)}</p>
          </div>
          <Link href="/admin/analytics" className="text-sm text-leaf">
            Analytics
          </Link>
        </div>
        <p className="mt-3 text-sm text-taupe">
          Goods on the order, not a delivery charge. Compared with the previous {phrase}.
        </p>
        <p className="mt-1 text-sm">{previousCompare(summary.range.preset, summary.current.revenueMinor, summary.previous.revenueMinor)}</p>
        <p className="mt-4 text-sm text-taupe">
          Goods {money(summary.current.goodsMinor)} · Delivery fees {money(summary.current.deliveryMinor)}
          {summary.profitMinor == null ? "" : ` · Estimated profit ${money(summary.profitMinor)}`}
        </p>
      </section>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <p className="text-sm text-taupe">Accra days to compare</p>
        <div className="mt-3">
          <RangePicker base="/admin" preset={query.preset} from={query.from ?? summary.range.from} to={query.to ?? summary.range.to} />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-taupe">Typical paid ticket</p>
            <p className="mt-2 font-serif text-4xl">{money(summary.current.averageMinor)}</p>
            <p className="mt-2 text-sm text-taupe">{previousCompare(summary.range.preset, summary.current.averageMinor, summary.previous.averageMinor)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-taupe">New customers</p>
            <p className="mt-2 font-serif text-4xl">{summary.newCustomers.current}</p>
            <p className="mt-2 text-sm text-taupe">{previousCompare(summary.range.preset, summary.newCustomers.current, summary.newCustomers.previous)}</p>
          </div>
        </div>
        <p className="mt-6 border-t border-espresso/10 pt-4 text-sm">
          {summary.current.orders} paid {summary.current.orders === 1 ? "order" : "orders"}.
        </p>
        <Sparkline days={summary.days} />
      </section>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <h2 className="font-serif text-2xl">{summary.days.length} days</h2>
        <p className="mt-1 text-sm text-taupe">Cedis. Today is the dark column.</p>
        {summary.current.orders === 0 ? <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p> : null}
        <div className={cn("mt-6 flex h-44 items-end gap-1", summary.days.length > 10 && "overflow-x-auto")}>
          {summary.days.map((point) => {
            const bits = dayBits(point.day);
            const isToday = point.day === today;
            return (
              <div key={point.day} className={cn("flex h-full flex-col justify-end", summary.days.length > 10 ? "w-8 shrink-0" : "min-w-0 flex-1")}>
                <div
                  className={cn("w-full rounded-t-sm", isToday ? "bg-espresso" : "bg-espresso/15")}
                  style={{ height: `${Math.max(point.revenueMinor > 0 ? 10 : 3, (point.revenueMinor / peak) * 100)}%` }}
                  title={`${money(point.revenueMinor)}`}
                />
                <p className="mt-2 text-center text-[10px] uppercase text-taupe">{bits.letter}</p>
                <p className={cn("text-center text-[11px]", isToday ? "font-semibold text-espresso" : "text-taupe")}>{bits.number}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Still waiting</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {actions.map(([label, count, href]) => (
            <li key={label}>
              <Link href={href} className="flex min-h-16 items-center justify-between gap-3 rounded-[1.25rem] border border-espresso/10 bg-white px-4">
                <span className="text-sm">{label}</span>
                <span className="font-serif text-2xl">{count}</span>
              </Link>
            </li>
          ))}
          {summary.action.review > 0 ? (
            <li className="sm:col-span-2">
              <Link href="/admin/orders?view=all&review=1" className="flex min-h-16 items-center justify-between gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4">
                <span className="text-sm">Paid orders to review</span>
                <span className="font-serif text-2xl">{summary.action.review}</span>
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function Sparkline({ days }: { days: { revenueMinor: number }[] }) {
  if (days.length < 2) return null;
  const width = 320;
  const height = 72;
  const peak = Math.max(1, ...days.map((day) => day.revenueMinor));
  const points = days
    .map((day, index) => {
      const x = (index / (days.length - 1)) * width;
      const y = height - 8 - (day.revenueMinor / peak) * (height - 16);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-16 w-full text-espresso" role="img" aria-label="Paid revenue across the selected days">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}
