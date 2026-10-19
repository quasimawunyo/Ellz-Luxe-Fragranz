import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { listStaff } from "@/lib/admin/staff";
import { listOrders } from "@/lib/orders/store";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { buildDashboardMetrics } from "@/lib/admin/metrics";
import { getLaunchStatus } from "@/lib/launch/status";
import { dataMode } from "@/lib/env";
import { formatMoney } from "@/lib/money";
import { roleLabel } from "@/lib/auth/roles";
import { StaffRoleForm } from "@/components/admin/staff-role-form";

export const metadata = { title: "Control · Super admin" };

export default async function SuperAdminPage() {
  const auth = await requireSuperAdmin();
  const [staff, orders, products] = await Promise.all([listStaff(), listOrders(), getAllProductsForAdmin()]);
  const metrics = buildDashboardMetrics(orders, products);
  const launch = getLaunchStatus();
  const missingPhotos = products.filter((product) => product.images.length === 0).length;

  const cards = [
    {
      label: "Accounts",
      value: String(staff.length),
      hint: `${staff.filter((member) => member.role === "super_admin").length} super · ${staff.filter((member) => member.role === "admin").length} admin`,
    },
    {
      label: "Live catalog",
      value: String(metrics.live.length),
      hint: `${metrics.demonstration.length} testers · ${missingPhotos} without photos`,
    },
    {
      label: "Checkout",
      value: launch.checkout,
      hint: launch.moolre ? "Moolre keys present" : "Card pay not configured",
    },
    {
      label: "Your role",
      value: "Super admin",
      hint: auth.email ?? "House owner",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl">Super admin</h1>
        <p className="mt-2 text-sm text-taupe">
          Staff roles, checkout keys, and catalog health. Day-to-day shop work stays in Orders and Products.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">{card.label}</p>
            <p className="mt-3 font-serif text-3xl leading-tight">{card.value}</p>
            <p className="mt-2 text-sm text-taupe">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl">House</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-taupe">Catalog saves</dt>
            <dd className="mt-1">{launch.canSaveCatalog ? "Ready" : "Needs service role key"}</dd>
          </div>
          <div>
            <dt className="text-taupe">Data</dt>
            <dd className="mt-1">{dataMode() === "supabase" ? "Supabase" : "Demonstration"}</dd>
          </div>
          <div>
            <dt className="text-taupe">Paid revenue</dt>
            <dd className="mt-1">{formatMoney(metrics.paidRevenue)}</dd>
          </div>
          <div>
            <dt className="text-taupe">Site URL</dt>
            <dd className="mt-1 break-all">{launch.siteUrl}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-taupe">Moolre callback</dt>
            <dd className="mt-1 break-all">{launch.moolreWebhook}</dd>
          </div>
        </dl>
        <p className="mt-5">
          <Link href="/admin/settings" className="text-sm text-leaf underline underline-offset-4">
            Store settings
          </Link>
        </p>
      </section>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Staff</h2>
        <p className="mt-2 text-sm text-taupe">
          Promote a signed-up account to Admin for day-to-day shop work. Only super admin can change roles.
        </p>
        {staff.length === 0 ? (
          <p className="mt-6 text-sm text-taupe">No accounts loaded. Add SUPABASE_SERVICE_ROLE_KEY to list staff.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-espresso/10 text-[11px] uppercase tracking-[0.16em] text-taupe">
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-espresso/5">
                    <td className="py-3">
                      <p className="font-medium">{member.fullName || member.email || member.id}</p>
                      <p className="mt-1 text-taupe">{member.email ?? "No email"}</p>
                    </td>
                    <td className="py-3">{roleLabel(member.role)}</td>
                    <td className="py-3">
                      <StaffRoleForm userId={member.id} role={member.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
