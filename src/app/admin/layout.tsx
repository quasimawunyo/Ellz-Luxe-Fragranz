import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();

  return (
    <div className="min-h-full bg-ivory">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-espresso/10 bg-white lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="px-5 py-6">
            <p className="font-serif text-2xl leading-none">EllzLuxe</p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-taupe">Admin</p>
            {auth.email ? <p className="mt-2 truncate text-sm text-taupe">{auth.email}</p> : null}
          </div>
          <div className="flex-1 px-3 pb-4">
            <AdminNav showControl={isSuperAdminRole(auth.role)} />
          </div>
          <div className="flex flex-col gap-2 border-t border-espresso/10 p-4 text-sm">
            <Link href="/admin/products/new" className="rounded-full bg-leaf px-4 py-2.5 text-center text-white hover:bg-leaf/90">
              New bottle
            </Link>
            <Link href="/shop" className="rounded-full border border-espresso/15 px-4 py-2.5 text-center hover:border-espresso/40">
              View shop
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
