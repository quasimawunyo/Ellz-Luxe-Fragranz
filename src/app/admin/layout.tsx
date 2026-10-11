import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name || "Annex";

  return (
    <div className="bg-ivory">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="bg-rich text-ivory lg:sticky lg:top-0 lg:flex lg:min-h-[calc(100vh-8rem)] lg:w-64 lg:shrink-0 lg:flex-col">
          <div className="border-b border-white/10 px-5 py-8">
            <p className="text-[10px] uppercase tracking-[0.42em] text-champagne">Ells Luxe Annex</p>
            <p className="mt-3 font-serif text-3xl">House desk</p>
            <p className="mt-3 text-sm leading-6 text-ivory/65">
              {name}
              {auth.email ? ` · ${auth.email}` : ""}
            </p>
          </div>
          <div className="flex-1 px-2 py-4">
            <AdminNav />
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 p-5 text-[11px] uppercase tracking-[0.22em]">
            <Link href="/shop" className="border border-ivory/25 px-4 py-2.5 text-center hover:border-champagne">
              View shop
            </Link>
            <Link href="/admin/products/new" className="bg-champagne px-4 py-2.5 text-center text-espresso">
              New product
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-10 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
