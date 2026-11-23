import Link from "next/link";
import { ActivityDesk } from "@/components/admin/activity-desk";
import { activityLabel, listStaffActivity } from "@/lib/admin/activity";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const metadata = { title: "Activity · Shop desk" };

const ACTIONS = ["sizes", "price", "stock", "order_status", "cancel", "refund", "payment", "coupon", "settings", "test"] as const;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string; action?: string; from?: string; to?: string; order?: string }>;
}) {
  await requireSuperAdmin();
  const query = await searchParams;
  const rows = await listStaffActivity({ ...query, person: undefined });

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
      <ActivityDesk
        rows={rows.map((row) => ({
          id: row.id,
          actorEmail: row.actorEmail,
          label: activityLabel(row.action),
          before: row.before,
          after: row.after,
          createdAt: row.createdAt,
        }))}
        initialPerson={query.person ?? ""}
        action={query.action}
        from={query.from}
        to={query.to}
        order={query.order}
        actions={ACTIONS.map((action) => ({ id: action, label: activityLabel(action) }))}
      />
    </div>
  );
}
