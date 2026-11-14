import Link from "next/link";
import { loadSalesSummary } from "@/lib/admin/summary";
import { formatAccraRange, readSalesQuery } from "@/lib/admin/summary-format";
import { formatMoney } from "@/lib/money";
import { RangePicker } from "@/components/admin/range-picker";
import { cn } from "@/lib/utils";

export const metadata = { title: "Analytics · Shop desk" };

function money(amountMinor: number) {
  if (amountMinor < 0) return `−${formatMoney(Math.abs(amountMinor))}`;
  return formatMoney(amountMinor);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const query = readSalesQuery(await searchParams);
  const summary = await loadSalesSummary(query.preset, query.from, query.to);
  const empty = summary.current.orders === 0;
  const networks = [
    ["MTN", summary.payments.mtnMinor],
    ["Telecel", summary.payments.telecelMinor],
    ["AT", summary.payments.atMinor],
  ].filter(([, amount]) => Number(amount) > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-serif text-4xl">Analytics</h1>
        <p className="mt-2 text-sm text-taupe">
          {formatAccraRange(summary.range.from, summary.range.to)} · paid orders only · Africa/Accra
        </p>
      </header>
      <RangePicker base="/admin/analytics" preset={query.preset} from={query.from ?? summary.range.from} to={query.to ?? summary.range.to} />
      {empty ? <p className="rounded-2xl border border-espresso/10 bg-white px-4 py-3 text-sm">No paid sales in this range.</p> : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">Paid revenue</p>
          <p className="mt-3 font-serif text-3xl">{money(summary.current.revenueMinor)}</p>
          <p className="mt-2 text-sm text-taupe">Goods {money(summary.current.goodsMinor)}</p>
          <p className="text-sm text-taupe">Delivery fees {money(summary.current.deliveryMinor)}</p>
          {summary.profitMinor == null ? null : <p className="text-sm text-taupe">Estimated profit {money(summary.profitMinor)}</p>}
        </article>
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">Orders</p>
          <p className="mt-3 font-serif text-3xl">{summary.current.orders}</p>
        </article>
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">Typical paid ticket</p>
          <p className="mt-3 font-serif text-3xl">{money(summary.current.averageMinor)}</p>
          <p className="mt-2 text-sm text-taupe">{summary.newCustomers.current} new customers</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Rank title="Top 5 by units" rows={summary.topUnits} empty={empty} by="units" />
        <Rank title="Top 5 by revenue" rows={summary.topRevenue} empty={empty} by="revenue" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <h2 className="font-serif text-2xl">Payments</h2>
          {empty ? (
            <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p>
          ) : (
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Mobile money" amount={summary.payments.mobileMoneyMinor} />
              {networks.map(([label, amount]) => (
                <Row key={String(label)} label={String(label)} amount={Number(amount)} nested />
              ))}
              <Row label="Card" amount={summary.payments.cardMinor} />
              {summary.payments.cashMinor > 0 ? <Row label="Cash" amount={summary.payments.cashMinor} /> : null}
              {summary.payments.unclassifiedMinor > 0 ? <Row label="Not classified" amount={summary.payments.unclassifiedMinor} /> : null}
            </dl>
          )}
        </article>
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <h2 className="font-serif text-2xl">Where it sold</h2>
          {empty ? (
            <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p>
          ) : (
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={`Online · ${summary.channel.onlineOrders}`} amount={summary.channel.onlineMinor} />
              <Row label={`In store · ${summary.channel.inStoreOrders}`} amount={summary.channel.inStoreMinor} />
            </dl>
          )}
          <p className="mt-4 text-sm text-taupe">In store stays at GH₵0.00 until a till exists.</p>
        </article>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Availability</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Sizes", summary.stock.sizes, "/admin/products"],
            ["In stock", summary.stock.inStock, "/admin/products?status=in_stock"],
            ["Low stock", summary.stock.lowStock, "/admin/products?status=low_stock"],
            ["Out of stock", summary.stock.outOfStock, "/admin/products?status=out_of_stock"],
          ].map(([label, value, href]) => (
            <Link key={String(label)} href={String(href)} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">{label}</p>
              <p className="mt-3 font-serif text-3xl">{value}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, amount, nested = false }: { label: string; amount: number; nested?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", nested && "pl-4 text-taupe")}>
      <dt>{label}</dt>
      <dd>{money(amount)}</dd>
    </div>
  );
}

function Rank({
  title,
  rows,
  empty,
  by,
}: {
  title: string;
  rows: { name: string; units: number; revenueMinor: number }[];
  empty: boolean;
  by: "units" | "revenue";
}) {
  return (
    <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
      <h2 className="font-serif text-2xl">{title}</h2>
      {empty || !rows.length ? (
        <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p>
      ) : (
        <ol className="mt-4 space-y-3 text-sm">
          {rows.map((row, index) => (
            <li key={row.name} className="flex justify-between gap-3">
              <span>
                {index + 1}. {row.name}
              </span>
              <span className="text-taupe">{by === "units" ? `${row.units} sold` : money(row.revenueMinor)}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
