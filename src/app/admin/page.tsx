import Link from "next/link";
import { AlertTriangle, Layers, Package, ShoppingBag, Wallet } from "lucide-react";
import { listOrders } from "@/lib/orders/store";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { countContactMessages, countNewsletterSubscribers, listContactMessages } from "@/lib/admin/inbox";
import { buildDashboardMetrics } from "@/lib/admin/metrics";
import { formatMoney } from "@/lib/money";
import { totalStock } from "@/lib/catalog/helpers";
import { StatusPill } from "@/components/admin/status-pill";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard · Admin" };

export default async function AdminDashboardPage() {
  const [orders, products, messages, subscribers, messageCount] = await Promise.all([
    listOrders(),
    getAllProductsForAdmin(),
    listContactMessages(6),
    countNewsletterSubscribers(),
    countContactMessages(),
  ]);
  const metrics = buildDashboardMetrics(orders, products, {
    messages: messageCount,
    subscribers,
  });

  const cards = [
    {
      label: "Paid revenue",
      value: formatMoney(metrics.paidRevenue),
      hint: `${metrics.paidCount} verified ${metrics.paidCount === 1 ? "order" : "orders"}`,
      icon: Wallet,
    },
    {
      label: "Awaiting payment",
      value: formatMoney(metrics.pendingValue),
      hint: `${metrics.pendingCount} not counted as income`,
      icon: ShoppingBag,
    },
    {
      label: "To pack",
      value: String(metrics.toPack.length),
      hint: "Paid, still unfulfilled",
      icon: Package,
    },
    {
      label: "Catalog",
      value: String(metrics.live.length),
      hint: `${metrics.demonstration.length} demonstration · ${metrics.drafts.length} draft`,
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
          <article key={card.label} className="border border-espresso/10 bg-white p-5 shadow-[0_1px_0_rgba(14,39,20,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-taupe">{card.label}</p>
              <Icon className="size-4 text-champagne" aria-hidden />
            </div>
            <p className="mt-4 font-serif text-3xl leading-none">{card.value}</p>
            <p className="mt-2 text-sm text-taupe">{card.hint}</p>
          </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="border border-espresso/10 bg-white p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl">Last 7 days</h2>
              <p className="mt-1 text-sm text-taupe">Paid only · Africa/Accra</p>
            </div>
            <p className="font-serif text-2xl">{formatMoney(metrics.weekRevenue)}</p>
          </div>
          <div className="mt-8 flex h-36 items-end gap-2">
            {metrics.weekSeries.map((point) => (
              <div key={point.label} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full bg-espresso"
                  style={{ height: `${Math.max(6, (point.amountMinor / metrics.weekPeak) * 100)}%` }}
                  title={`${point.label}: ${formatMoney(point.amountMinor)}`}
                />
                <p className="mt-2 truncate text-center text-[10px] uppercase tracking-widest text-taupe">{point.label}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-espresso/10 bg-white p-6">
          <h2 className="font-serif text-3xl">Quick actions</h2>
          <ul className="mt-6 space-y-3 text-sm">
            <li>
              <Link href="/admin/products/new" className={cn(buttonVariants({ variant: "gold" }), "w-full")}>
                Add a live bottle
              </Link>
            </li>
            <li>
              <Link href="/admin/orders?payment=pending" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Review unpaid checkouts
              </Link>
            </li>
            <li>
              <Link href="/admin/inbox" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Open inbox
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-0")}>
                Delivery fees and annex copy →
              </Link>
            </li>
          </ul>
            <p className="mt-6 text-sm text-taupe">
              {metrics.subscribers} newsletter {metrics.subscribers === 1 ? "address" : "addresses"} · {metrics.messages} contact {metrics.messages === 1 ? "note" : "notes"}.
            </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="border border-espresso/10 bg-white">
          <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4">
            <h2 className="font-serif text-3xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-[0.16em] text-taupe">
              All orders
            </Link>
          </div>
          <ul className="divide-y divide-espresso/10">
            {orders.slice(0, 8).map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-ivory">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-taupe">
                      {order.fullName} · {order.locality}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatMoney(order.totalMinor, order.currencyCode)}</p>
                    <div className="mt-2 flex justify-end gap-2">
                      <StatusPill value={order.paymentStatus} />
                      <StatusPill value={order.fulfillmentStatus} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {!orders.length ? <li className="px-6 py-10 text-sm text-taupe">No orders yet. New checkouts will land here.</li> : null}
          </ul>
        </article>

        <article className="border border-espresso/10 bg-white">
          <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4">
            <h2 className="font-serif text-3xl">Needs attention</h2>
            {metrics.lowStock.length || metrics.outOfStock.length || metrics.toPack.length ? (
              <AlertTriangle className="size-4 text-champagne" aria-hidden />
            ) : null}
          </div>
          <div className="space-y-6 px-6 py-5 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-taupe">Packing</p>
              {metrics.toPack.length ? (
                <ul className="mt-2 space-y-2">
                  {metrics.toPack.slice(0, 4).map((order) => (
                    <li key={order.id}>
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-champagne">
                        {order.orderNumber} · {order.fullName}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-taupe">Nothing paid waiting to pack.</p>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-taupe">Stock</p>
              {metrics.lowStock.length || metrics.outOfStock.length ? (
                <ul className="mt-2 space-y-2">
                  {metrics.outOfStock.slice(0, 3).map((product) => (
                    <li key={product.id}>
                      <Link href={`/admin/products/${product.id}`}>
                        {product.name} · out of stock
                      </Link>
                    </li>
                  ))}
                  {metrics.lowStock.slice(0, 4).map((product) => (
                    <li key={product.id}>
                      <Link href={`/admin/products/${product.id}`}>
                        {product.name} · {totalStock(product)} left
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-taupe">No low-stock alerts.</p>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-taupe">Best sellers (paid)</p>
              {metrics.bestSellers.length ? (
                <ul className="mt-2 space-y-2">
                  {metrics.bestSellers.map((item) => (
                    <li key={item.name}>
                      {item.name} · {item.quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-taupe">No paid sales yet.</p>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="border border-espresso/10 bg-white">
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4">
          <h2 className="font-serif text-3xl">Latest messages</h2>
          <Link href="/admin/inbox" className="text-xs uppercase tracking-[0.16em] text-taupe">
            Inbox
          </Link>
        </div>
        <ul className="divide-y divide-espresso/10">
          {messages.map((note) => (
            <li key={note.id} className="px-6 py-4">
              <p className="font-medium">
                {note.name} · <span className="font-normal text-taupe">{note.email}</span>
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-espresso/80">{note.message}</p>
            </li>
          ))}
          {!messages.length ? (
            <li className="px-6 py-10 text-sm text-taupe">Contact form notes appear here when the database is connected.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
