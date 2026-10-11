import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  const name = auth.profile?.full_name || "Admin";

  return (
    <div className="min-h-full bg-ivory">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="bg-rich text-ivory lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:w-56 lg:shrink-0 lg:flex-col">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="text-sm font-medium">Admin</p>
            <p className="mt-2 text-sm leading-5 text-ivory/65">
              {name}
              {auth.email ? ` · ${auth.email}` : ""}
            </p>
          </div>
          <div className="flex-1 px-2 py-3">
            <AdminNav />
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 p-4 text-sm">
            <Link href="/shop" className="border border-ivory/20 px-3 py-2 text-center hover:border-ivory/50">
              View shop
            </Link>
            <Link href="/admin/products/new" className="bg-champagne px-3 py-2 text-center text-espresso">
              New product
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
