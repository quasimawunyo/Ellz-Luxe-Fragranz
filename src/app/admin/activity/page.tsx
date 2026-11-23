import Link from "next/link";
import { activityLabel, listStaffActivity } from "@/lib/admin/activity";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Activity · Shop desk" };

const ACTIONS = ["sizes", "price", "stock", "order_status", "cancel", "refund", "payment", "coupon", "settings", "test"] as const;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string; action?: string; from?: string; to?: string; order?: string }>;
}) {
  await requireSuperAdmin();
  const query = await searchParams;
  const rows = await listStaffActivity(query);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-4xl">Activity</h1>
      <p className="mt-2 text-sm text-taupe">
        {query.order ? "Changes recorded for this order." : "Who changed prices, stock, orders, coupons, and settings."}
      </p>
      {query.order ? (
        <p className="mt-3 text-sm">
          <Link href={`/admin/orders/${query.order}`} className="underline">
            Back to the order
          </Link>
        </p>
      ) : null}
      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" method="get">
        {query.order ? <input type="hidden" name="order" value={query.order} /> : null}
        <Input name="person" defaultValue={query.person} placeholder="Person" aria-label="Person" />
        <select name="action" defaultValue={query.action ?? ""} aria-label="Action" className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
          <option value="">All actions</option>
          {ACTIONS.map((action) => (
            <option key={action} value={action}>
              {activityLabel(action)}
            </option>
          ))}
        </select>
        <Input name="from" type="date" defaultValue={query.from} aria-label="From" />
        <Input name="to" type="date" defaultValue={query.to} aria-label="To" />
        <Button type="submit">Filter</Button>
      </form>
      <ul className="mt-8 divide-y divide-espresso/10 rounded-[1.25rem] border border-espresso/10 bg-white">
        {rows.map((row) => (
          <li key={row.id} className="px-4 py-4 text-sm">
            <p>{activityLabel(row.action)}</p>
            {row.before || row.after ? (
              <p className="mt-1 text-taupe">
                {row.before || "—"} → {row.after || "—"}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-taupe">
              {row.actorEmail} ·{" "}
              {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }).format(new Date(row.createdAt))}
            </p>
          </li>
        ))}
        {!rows.length ? <li className="px-4 py-8 text-sm text-taupe">No activity yet.</li> : null}
      </ul>
    </div>
  );
}
