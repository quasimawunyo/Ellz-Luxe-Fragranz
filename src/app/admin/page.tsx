import Link from "next/link";
import { loadSalesSummary } from "@/lib/admin/summary";
import { formatAccraRange, periodChange, salesPreset } from "@/lib/admin/summary-format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overview · Admin" };

const RANGES = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["month", "This month"],
  ["custom", "Custom"],
] as const;

function money(amountMinor: number) {
  if (amountMinor < 0) return `−${formatMoney(Math.abs(amountMinor))}`;
  return formatMoney(amountMinor);
}

function ChangeNote({ current, previous }: { current: number; previous: number }) {
  const change = periodChange(current, previous);
  if (change.direction === "new") return <p className="mt-2 text-sm text-leaf">New</p>;
  if (change.direction === "up") return <p className="mt-2 text-sm text-leaf">Up {change.percent}%</p>;
  if (change.direction === "down") return <p className="mt-2 text-sm text-red-800">Down {change.percent}%</p>;
  return <p className="mt-2 text-sm text-taupe">No change</p>;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const preset = salesPreset(params.range);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(params.from ?? "") ? params.from : undefined;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(params.to ?? "") ? params.to : undefined;
  const summary = await loadSalesSummary(preset, from, to);
  const empty = summary.current.orders === 0;
  const peak = Math.max(1, ...summary.days.map((day) => day.revenueMinor));
  const wide = summary.days.length > 10;
  const networks = [
    ["MTN", summary.payments.mtnMinor],
    ["Telecel", summary.payments.telecelMinor],
    ["AT", summary.payments.atMinor],
  ].filter(([, amount]) => Number(amount) > 0);

  const actions = [
    ["Paid, waiting to be packed", summary.action.toPack, "/admin/orders?view=all&payment=paid&fulfilment=new"],
    ["Waiting for a delivery fee", summary.action.needsFee, "/admin/orders?view=all&fee=missing"],
    ["Out for delivery", summary.action.outForDelivery, "/admin/orders?view=all&fulfilment=out_for_delivery"],
    ["Needs attention", summary.action.needsAttention, "/admin/orders?view=all&attention=1"],
  ] as const;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-taupe">Paid sales · Africa/Accra</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {RANGES.map(([id, label]) => (
          <Link
            key={id}
            href={id === "7d" ? "/admin" : `/admin?range=${id}`}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm",
              preset === id ? "bg-espresso text-ivory" : "border border-espresso/10 bg-white",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
      {preset === "custom" ? (
        <form className="flex flex-col gap-2 sm:flex-row sm:items-end" method="get">
          <input type="hidden" name="range" value="custom" />
          <label className="text-sm text-taupe">
            From
            <input name="from" type="date" defaultValue={from ?? summary.range.from} className="mt-1 block h-11 w-full border border-espresso/15 bg-white px-3 text-espresso" />
          </label>
          <label className="text-sm text-taupe">
            To
            <input name="to" type="date" defaultValue={to ?? summary.range.to} className="mt-1 block h-11 w-full border border-espresso/15 bg-white px-3 text-espresso" />
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-espresso px-5 text-sm text-ivory">
            Apply
          </button>
        </form>
      ) : null}
      <p className="text-sm text-taupe">
        {formatAccraRange(summary.range.from, summary.range.to)}
        {" · compared with "}
        {formatAccraRange(summary.range.previousFrom, summary.range.previousTo)}
      </p>

      {empty ? (
        <p className="rounded-2xl border border-espresso/10 bg-white px-4 py-3 text-sm">No paid sales in this range.</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["Paid revenue", money(summary.current.revenueMinor), summary.current.revenueMinor, summary.previous.revenueMinor],
          ["Orders", String(summary.current.orders), summary.current.orders, summary.previous.orders],
          ["Average order", money(summary.current.averageMinor), summary.current.averageMinor, summary.previous.averageMinor],
        ].map(([label, value, current, previous]) => (
          <article key={String(label)} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">{label}</p>
            <p className="mt-3 font-serif text-3xl leading-tight">{value}</p>
            <ChangeNote current={Number(current)} previous={Number(previous)} />
          </article>
        ))}
      </section>
      <p className="text-sm text-taupe">
        Goods {money(summary.current.goodsMinor)} · Delivery fees {money(summary.current.deliveryMinor)}
        {summary.profitMinor == null ? "" : ` · Estimated profit ${money(summary.profitMinor)}`}
      </p>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <h2 className="font-serif text-2xl">Daily revenue</h2>
        {empty ? (
          <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p>
        ) : (
          <div className={cn("mt-6 flex h-40 items-end gap-2", wide && "overflow-x-auto")}>
            {summary.days.map((point) => (
              <div key={point.day} className={cn("flex h-full flex-col justify-end", wide ? "w-8 shrink-0" : "min-w-0 flex-1")}>
                <div
                  className="w-full rounded-t-md bg-leaf"
                  style={{ height: `${Math.max(point.revenueMinor > 0 ? 8 : 2, (point.revenueMinor / peak) * 100)}%` }}
                  title={`${formatAccraDayLabel(point.day)}: ${money(point.revenueMinor)}`}
                />
                <p className="mt-2 truncate text-center text-[10px] text-taupe">{formatAccraDayLabel(point.day)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProductList title="Top 5 by units" rows={summary.topUnits} empty={empty} by="units" />
        <ProductList title="Top 5 by revenue" rows={summary.topRevenue} empty={empty} by="revenue" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <h2 className="font-serif text-2xl">Payments</h2>
          {empty ? (
            <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p>
          ) : (
            <dl className="mt-4 space-y-2 text-sm">
              <Split label="Mobile money" amount={summary.payments.mobileMoneyMinor} />
              {networks.map(([label, amount]) => (
                <Split key={String(label)} label={String(label)} amount={Number(amount)} nested />
              ))}
              <Split label="Card" amount={summary.payments.cardMinor} />
              {summary.payments.cashMinor > 0 ? <Split label="Cash" amount={summary.payments.cashMinor} /> : null}
              {summary.payments.unclassifiedMinor > 0 ? (
                <Split label="Not classified" amount={summary.payments.unclassifiedMinor} />
              ) : null}
            </dl>
          )}
        </article>
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <h2 className="font-serif text-2xl">Where it sold</h2>
          {empty ? (
            <p className="mt-4 text-sm text-taupe">No paid sales in this range.</p>
          ) : (
            <dl className="mt-4 space-y-2 text-sm">
              <Split label={`Online · ${summary.channel.onlineOrders}`} amount={summary.channel.onlineMinor} />
              <Split label={`In store · ${summary.channel.inStoreOrders}`} amount={summary.channel.inStoreMinor} />
            </dl>
          )}
        </article>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Needs action</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {actions.map(([label, count, href]) => (
            <li key={label}>
              <Link href={href} className="flex min-h-16 items-center justify-between gap-3 rounded-[1.25rem] border border-espresso/10 bg-white px-4 py-3">
                <span className="text-sm">{label}</span>
                <span className="font-serif text-2xl">{count}</span>
              </Link>
            </li>
          ))}
          {summary.action.review > 0 ? (
            <li>
              <Link href="/admin/orders?view=all&review=1" className="flex min-h-16 items-center justify-between gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3">
                <span className="text-sm">Paid orders to review</span>
                <span className="font-serif text-2xl">{summary.action.review}</span>
              </Link>
            </li>
          ) : null}
        </ul>
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
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
            <h3 className="font-serif text-xl">Low stock</h3>
            {summary.stock.low.length ? (
              <ul className="mt-3 space-y-3 text-sm">
                {summary.stock.low.map((row) => (
                  <li key={row.variantId} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {row.productName} · {row.label} · {row.quantity} left
                    </span>
                    <Link href={`/admin/products/stock/${row.variantId}`} className="inline-flex min-h-11 items-center text-leaf underline underline-offset-4">
                      Adjust stock
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-taupe">No tracked sizes are low.</p>
            )}
          </article>
          <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
            <h3 className="font-serif text-xl">No photo</h3>
            <p className="mt-1 text-sm text-taupe">{summary.stock.noPhotoCount} {summary.stock.noPhotoCount === 1 ? "product" : "products"}</p>
            {summary.stock.noPhoto.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {summary.stock.noPhoto.map((product) => (
                  <li key={product.id}>
                    <Link href={`/admin/products/${product.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-taupe">Every product has a photo.</p>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

function formatAccraDayLabel(isoDate: string) {
  return new Intl.DateTimeFormat("en-GH", { day: "numeric", month: "short", timeZone: "Africa/Accra" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

function Split({ label, amount, nested = false }: { label: string; amount: number; nested?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", nested && "pl-4 text-taupe")}>
      <dt>{label}</dt>
      <dd>{money(amount)}</dd>
    </div>
  );
}

function ProductList({
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
            <li key={row.name} className="flex items-start justify-between gap-3">
              <span>
                {index + 1}. {row.name}
              </span>
              <span className="shrink-0 text-taupe">
                {by === "units" ? `${row.units} sold` : money(row.revenueMinor)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
