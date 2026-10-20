import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();

  return (
    <div className="min-h-full bg-ivory">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-espresso/10 bg-white lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="px-4 py-5 lg:px-5">
            <Link href="/" className="flex min-h-11 items-center gap-3">
              <BrandLogo href={false} label="" className="w-16" size={160} priority />
              <span className="min-w-0">
                <span className="block font-serif text-xl leading-tight">EllzLuxe Fragranz</span>
                <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.2em] text-taupe">Admin</span>
              </span>
            </Link>
            {auth.email ? <p className="mt-3 truncate text-sm text-taupe">{auth.email}</p> : null}
          </div>
          <div className="flex-1 px-3 pb-4">
            <AdminNav showControl={isSuperAdminRole(auth.role)} />
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-espresso/10 p-4 text-sm lg:grid-cols-1">
            <Link href="/admin/products/new" className="inline-flex min-h-11 items-center justify-center rounded-full bg-leaf px-4 text-center text-white hover:bg-leaf/90">
              New bottle
            </Link>
            <Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-full border border-espresso/15 px-4 text-center hover:border-espresso/40">
              View shop
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
