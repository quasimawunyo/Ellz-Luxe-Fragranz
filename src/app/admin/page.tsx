import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { countContactMessages, countNewsletterSubscribers, listContactMessages } from "@/lib/admin/inbox";
import { buildDashboardMetrics } from "@/lib/admin/metrics";
import { formatMoney } from "@/lib/money";
import { totalStock } from "@/lib/catalog/helpers";
import { StatusPill } from "@/components/admin/status-pill";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";
import { getLaunchStatus } from "@/lib/launch/status";

export const metadata = { title: "Overview · Admin" };

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
  const launch = getLaunchStatus();

  const cards = [
    {
      label: "Paid revenue",
      value: formatMoney(metrics.paidRevenue),
      hint: `${metrics.paidCount} verified ${metrics.paidCount === 1 ? "order" : "orders"}`,
    },
    {
      label: "Awaiting payment",
      value: formatMoney(metrics.pendingValue),
      hint: `${metrics.pendingCount} not counted as income`,
    },
    {
      label: "To pack",
      value: String(metrics.toPack.length),
      hint: "Paid, still unfulfilled",
    },
    {
      label: "Catalog",
      value: String(metrics.live.length),
      hint: `${metrics.demonstration.length} testers · ${metrics.drafts.length} drafts`,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-taupe">Paid orders, packing, and the live catalog.</p>
      </header>
      {(!launch.canSaveCatalog || launch.checkout === "WhatsApp") && (
        <p className="rounded-2xl border border-espresso/10 bg-white px-4 py-3 text-sm">
          {launch.canSaveCatalog
            ? "Catalog saves are on. Card checkout waits on Moolre keys."
            : "Product saves need the service role key. Checkout stays on WhatsApp until Moolre keys are set."}{" "}
          <Link href="/admin/settings" className="text-leaf underline underline-offset-4">
            Settings
          </Link>
        </p>
      )}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">{card.label}</p>
            <p className="mt-3 font-serif text-3xl leading-tight">{card.value}</p>
            <p className="mt-2 text-sm text-taupe">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Last 7 days</h2>
              <p className="mt-1 text-sm text-taupe">Paid only · Africa/Accra</p>
            </div>
            <p className="font-serif text-2xl">{formatMoney(metrics.weekRevenue)}</p>
          </div>
          <div className="mt-8 flex h-36 items-end gap-2">
            {metrics.weekSeries.map((point) => (
              <div key={point.label} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-t-md bg-leaf"
                  style={{ height: `${Math.max(6, (point.amountMinor / metrics.weekPeak) * 100)}%` }}
                  title={`${point.label}: ${formatMoney(point.amountMinor)}`}
                />
                <p className="mt-2 truncate text-center text-[10px] text-taupe">{point.label}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <h2 className="font-serif text-2xl">Open</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              ["New bottle", "/admin/products/new"],
              ["Unpaid orders", "/admin/orders?payment=pending"],
              ["Inbox", "/admin/inbox"],
              ["Settings", "/admin/settings"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-espresso/10 px-3 py-3 text-sm hover:border-leaf"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-taupe">
            {metrics.subscribers} newsletter {metrics.subscribers === 1 ? "address" : "addresses"} · {metrics.messages}{" "}
            contact {metrics.messages === 1 ? "note" : "notes"}.
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="overflow-hidden rounded-[1.25rem] border border-espresso/10 bg-white">
          <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
            <h2 className="font-serif text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-taupe hover:text-espresso">
              All orders
            </Link>
          </div>
          <ul className="divide-y divide-espresso/10">
            {orders.slice(0, 8).map((order) => (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-champagne">
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-sm text-taupe">
                      {order.fullName} · {order.locality}
                    </p>
                    <CustomerWhatsApp
                      className="mt-2"
                      phone={order.phone}
                      name={order.fullName}
                      orderNumber={order.orderNumber}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatMoney(order.totalMinor, order.currencyCode)}</p>
                    <div className="mt-2 flex justify-end gap-2">
                      <StatusPill value={order.paymentStatus} />
                      <StatusPill value={order.fulfillmentStatus} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {!orders.length ? <li className="px-6 py-10 text-sm text-taupe">No orders yet.</li> : null}
          </ul>
        </article>

        <article className="overflow-hidden rounded-[1.25rem] border border-espresso/10 bg-white">
          <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
            <h2 className="font-serif text-2xl">Needs attention</h2>
          </div>
          <div className="space-y-6 px-6 py-5 text-sm">
            <div>
              <p className="text-sm font-medium text-taupe">Packing</p>
              {metrics.toPack.length ? (
                <ul className="mt-2 space-y-2">
                  {metrics.toPack.slice(0, 4).map((order) => (
                    <li key={order.id}>
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-champagne">
                        {order.orderNumber} · {order.fullName}
                      </Link>
                      <CustomerWhatsApp
                        className="mt-1"
                        phone={order.phone}
                        name={order.fullName}
                        orderNumber={order.orderNumber}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-taupe">Nothing paid waiting to pack.</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-taupe">Stock</p>
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
              <p className="text-sm font-medium text-taupe">Best sellers (paid)</p>
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

      <section className="overflow-hidden rounded-[1.25rem] border border-espresso/10 bg-white">
        <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
          <h2 className="font-serif text-2xl">Latest messages</h2>
          <Link href="/admin/inbox" className="text-sm text-taupe hover:text-espresso">
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
            <li className="px-6 py-10 text-sm text-taupe">No messages yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
