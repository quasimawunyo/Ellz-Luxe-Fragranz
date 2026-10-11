"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Inbox, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", hint: "Sales and packing", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", hint: "Catalog and stock", icon: Package },
  { href: "/admin/orders", label: "Orders", hint: "Customers and WhatsApp", icon: ShoppingBag },
  { href: "/admin/inbox", label: "Inbox", hint: "Messages and letters", icon: Inbox },
  { href: "/admin/settings", label: "Settings", hint: "House and payments", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="House desk" className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-start gap-3 border-l-2 px-4 py-3 transition-colors",
              active
                ? "border-champagne bg-champagne/15 text-ivory"
                : "border-transparent text-ivory/70 hover:border-ivory/25 hover:bg-white/5 hover:text-ivory",
            )}
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-champagne" : "text-ivory/50")} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-[0.2em]">{link.label}</span>
              <span className={cn("mt-1 block text-xs font-sans normal-case tracking-normal", active ? "text-ivory/70" : "text-ivory/40")}>
                {link.hint}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
