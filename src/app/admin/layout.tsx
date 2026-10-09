import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Administration</p>
      <nav className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em]">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/settings">Settings</Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
