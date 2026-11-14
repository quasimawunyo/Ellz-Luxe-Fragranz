import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { listStaff } from "@/lib/admin/staff";
import { getLaunchStatus } from "@/lib/launch/status";
import { dataMode } from "@/lib/env";
import { roleLabel } from "@/lib/auth/roles";
import { StaffRoleForm } from "@/components/admin/staff-role-form";

export const metadata = { title: "Control · Settings" };

export default async function SettingsControlPage() {
  const auth = await requireSuperAdmin();
  const staff = await listStaff();
  const launch = getLaunchStatus();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-taupe">
          <Link href="/admin/settings" className="underline underline-offset-4">
            Settings
          </Link>
        </p>
        <h1 className="mt-2 font-serif text-4xl">Control</h1>
        <p className="mt-2 text-sm text-taupe">Staff roles, checkout keys, the callback URL, and where the shop data lives.</p>
      </header>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl">House</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-taupe">Your role</dt>
            <dd className="mt-1">Super admin{auth.email ? ` · ${auth.email}` : ""}</dd>
          </div>
          <div>
            <dt className="text-taupe">Data</dt>
            <dd className="mt-1">{dataMode() === "supabase" ? "Supabase" : "Demonstration"}</dd>
          </div>
          <div>
            <dt className="text-taupe">Catalog saves</dt>
            <dd className="mt-1">{launch.canSaveCatalog ? "Ready" : "Needs service role key"}</dd>
          </div>
          <div>
            <dt className="text-taupe">Checkout</dt>
            <dd className="mt-1">{launch.checkout}</dd>
          </div>
          <div>
            <dt className="text-taupe">Moolre</dt>
            <dd className="mt-1">{launch.moolre ? "Keys present" : "Not set"}</dd>
          </div>
          <div>
            <dt className="text-taupe">Paystack</dt>
            <dd className="mt-1">{launch.paystack ? "Keys present" : "Not set"}</dd>
          </div>
          <div>
            <dt className="text-taupe">Site URL</dt>
            <dd className="mt-1 break-all">{launch.siteUrl}</dd>
          </div>
          <div>
            <dt className="text-taupe">Order email</dt>
            <dd className="mt-1">{launch.orderEmail ? "Annex and customer" : "Add RESEND_API_KEY"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-taupe">Moolre callback</dt>
            <dd className="mt-1 break-all">{launch.moolreWebhook}</dd>
          </div>
          {launch.orderPushUrl ? (
            <div className="sm:col-span-2">
              <dt className="text-taupe">Order phone ping</dt>
              <dd className="mt-1">
                <a href={launch.orderPushUrl} className="break-all underline underline-offset-4" target="_blank" rel="noreferrer">
                  Open this on your phone once, then allow notifications.
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-[1.25rem] border border-espresso/10 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Staff</h2>
        <p className="mt-2 text-sm text-taupe">
          Promote a signed-up account to Admin for day-to-day shop work. Only a super admin can change roles.
        </p>
        {staff.length === 0 ? (
          <p className="mt-6 text-sm text-taupe">No accounts loaded. Add the service role key to list staff.</p>
        ) : (
          <>
            <ul className="mt-6 space-y-5 lg:hidden">
              {staff.map((member) => (
                <li key={member.id} className="border-b border-espresso/10 pb-5">
                  <p className="font-medium">{member.fullName || member.email || member.id}</p>
                  <p className="mt-1 text-sm text-taupe">{member.email ?? "No email"}</p>
                  <p className="mt-1 text-sm">{roleLabel(member.role)}</p>
                  <div className="mt-3">
                    <StaffRoleForm userId={member.id} role={member.role} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 hidden overflow-x-auto lg:block">
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
          </>
        )}
      </section>
    </div>
  );
}
