import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name || "Annex";

  return (
    <div className="bg-ivory">
      <div className="bg-rich text-ivory">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.42em] text-champagne">Ells Luxe Annex</p>
            <p className="mt-3 font-serif text-5xl">House desk</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ivory/70">
              Signed in as {name}
              {auth.email ? ` · ${auth.email}` : ""}. Paid totals stay webhook-verified.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.22em]">
            <Link href="/shop" className="border border-ivory/25 px-5 py-2.5 hover:border-champagne">
              View shop
            </Link>
            <Link href="/admin/products/new" className="bg-champagne px-5 py-2.5 text-espresso">
              New product
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <AdminNav />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">{children}</div>
    </div>
  );
}
