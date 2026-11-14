import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { getStoreSettings } from "@/lib/catalog/queries";
import { getLaunchStatus } from "@/lib/launch/status";

export const metadata = { title: "Connections · Shop desk" };

export default async function ConnectionsPage() {
  const [auth, settings] = await Promise.all([requireAdmin(), getStoreSettings()]);
  const launch = getLaunchStatus();
  const rows = [
    ["WhatsApp", settings.contactPhone || "Not set"],
    ["Checkout", launch.checkout],
    ["Moolre", launch.moolre ? "Keys present" : "Not set"],
    ["Paystack", launch.paystack ? "Keys present" : "Not set"],
    ["Order email", launch.orderEmail ? "Annex and customer" : "Not set"],
    ["Catalog saves", launch.canSaveCatalog ? "Ready" : "Needs the service role key"],
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-4xl">Connections</h1>
      <p className="mt-2 text-sm text-taupe">How the shop reaches customers and takes payment.</p>
      <dl className="mt-6 divide-y divide-espresso/10 rounded-[1.25rem] border border-espresso/10 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-4 text-sm">
            <dt className="text-taupe">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
      {isSuperAdminRole(auth.role) ? (
        <p className="mt-4 text-sm">
          <Link href="/admin/settings/control" className="text-leaf underline underline-offset-4">
            Control
          </Link>
          <span className="text-taupe"> — staff roles, keys, and the callback URL.</span>
        </p>
      ) : null}
    </div>
  );
}
