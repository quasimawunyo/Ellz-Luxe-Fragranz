import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name || "Annex";

  return (
    <div className="bg-[#f6f3ec]">
      <div className="bg-rich text-ivory">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">Ells Luxe Annex</p>
            <p className="mt-2 font-serif text-4xl">House desk</p>
            <p className="mt-2 max-w-xl text-sm text-ivory/70">
              Signed in as {name}
              {auth.email ? ` · ${auth.email}` : ""}. Paid totals stay webhook-verified.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em]">
            <Link href="/shop" className="border border-ivory/20 px-4 py-2 hover:border-champagne">
              View shop
            </Link>
            <Link href="/admin/products/new" className="bg-champagne px-4 py-2 text-espresso">
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
