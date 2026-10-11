import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();

  return (
    <div className="min-h-full bg-[#f6f6f6]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-espresso/10 bg-white lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="px-5 py-6">
            <p className="text-base font-semibold tracking-tight text-espresso">EllzLuxe Fragranz</p>
            {auth.email ? <p className="mt-1 text-sm text-taupe">{auth.email}</p> : null}
          </div>
          <div className="flex-1 px-3 pb-4">
            <AdminNav />
          </div>
          <div className="flex flex-col gap-2 border-t border-espresso/10 p-4 text-sm">
            <Link href="/shop" className="rounded-full border border-espresso/15 px-4 py-2.5 text-center hover:border-espresso/40">
              View shop
            </Link>
            <Link href="/admin/products/new" className="rounded-full bg-espresso px-4 py-2.5 text-center text-ivory">
              New product
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
