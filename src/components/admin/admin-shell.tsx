"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ClipboardList,
  Home,
  Inbox,
  LineChart,
  Package,
  Percent,
  Plug,
  Plus,
  Settings,
  Tags,
  Ticket,
  Truck,
  Users,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: typeof Home; exact?: boolean; match?: (pathname: string) => boolean };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Desk",
    items: [
      { href: "/admin", label: "Home", icon: Home, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ClipboardList, match: (path) => path.startsWith("/admin/orders") },
      { href: "/admin/pack", label: "Pack desk", icon: Package, match: (path) => path.startsWith("/admin/pack") },
      {
        href: "/admin/products",
        label: "Edit products",
        icon: Package,
        match: (path) => path.startsWith("/admin/products") && path !== "/admin/products/new" && !path.startsWith("/admin/products/stock") && !path.startsWith("/admin/products/opening"),
      },
      { href: "/admin/products/new", label: "Add product", icon: Plus, exact: true },
      {
        href: "/admin/stock",
        label: "Stock",
        icon: Archive,
        match: (path) => path.startsWith("/admin/stock") || path.startsWith("/admin/products/stock") || path.startsWith("/admin/products/opening"),
      },
      { href: "/admin/categories", label: "Categories", icon: Tags, match: (path) => path.startsWith("/admin/categories") },
    ],
  },
  {
    label: "Selling",
    items: [
      { href: "/admin/discounts", label: "Discounts", icon: Percent, match: (path) => path.startsWith("/admin/discounts") },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket, match: (path) => path.startsWith("/admin/coupons") },
      { href: "/admin/customers", label: "Customers", icon: Users, match: (path) => path.startsWith("/admin/customers") },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: LineChart, match: (path) => path.startsWith("/admin/analytics") },
      { href: "/admin/delivery", label: "Delivery", icon: Truck, match: (path) => path.startsWith("/admin/delivery") },
      { href: "/admin/connections", label: "Connections", icon: Plug, match: (path) => path.startsWith("/admin/connections") },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, match: (path) => path.startsWith("/admin/inbox") },
      { href: "/admin/settings", label: "Settings", icon: Settings, match: (path) => path.startsWith("/admin/settings") },
    ],
  },
];

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "EL";
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Shop desk" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ivory/50">{group.label}</p>
          <ul className="mt-2 space-y-1">
            {group.items.map((item) => {
              const active = item.match ? item.match(pathname) : item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px]",
                      active ? "bg-ivory font-medium text-espresso" : "text-ivory/90 hover:bg-white/10",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Person({ name, email }: { name: string; email: string | null }) {
  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory text-sm font-medium text-espresso">{initials(name)}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{name}</span>
          {email ? <span className="block truncate text-xs text-ivory/60">{email}</span> : null}
        </span>
      </div>
      <div className="mt-4 flex flex-col items-start gap-2 text-sm">
        <Link href="/shop" className="text-ivory/80 hover:text-ivory">
          View store
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="text-ivory/80 hover:text-ivory">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ name, email, children }: { name: string; email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-full bg-ivory">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-espresso text-ivory print:hidden lg:flex">
          <div className="flex items-center gap-3 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-ivory text-sm font-semibold text-espresso">EL</span>
            <span>
              <span className="block font-serif text-lg leading-tight">EllzLuxe Fragranz</span>
              <span className="mt-0.5 block text-[11px] uppercase tracking-[0.16em] text-ivory/55">Shop desk</span>
            </span>
          </div>
          <NavLinks pathname={pathname} />
          <Person name={name} email={email} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between bg-espresso px-4 py-3 text-ivory print:hidden lg:hidden">
            <button type="button" className="min-h-11 px-1 text-sm" onClick={() => setOpen(true)}>
              Menu
            </button>
            <Link href="/shop" className="min-h-11 px-1 text-sm">
              Store
            </Link>
          </header>
          <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button type="button" className="absolute inset-0 bg-espresso/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(100%,20rem)] flex-col bg-espresso text-ivory">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm">Menu</p>
              <button type="button" className="grid size-11 place-items-center" aria-label="Close" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 px-5 pb-2">
              <span className="grid size-10 place-items-center rounded-xl bg-ivory text-sm font-semibold text-espresso">EL</span>
              <span>
                <span className="block font-serif text-lg leading-tight">EllzLuxe Fragranz</span>
                <span className="block text-[11px] uppercase tracking-[0.16em] text-ivory/55">Shop desk</span>
              </span>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <Person name={name} email={email} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
