"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, Package, Inbox, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const CONTROL = { href: "/admin/super", label: "Control", icon: Shield, exact: true };

export function AdminNav({ showControl = false }: { showControl?: boolean }) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const links = showControl ? [CONTROL, ...LINKS] : LINKS;
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {links.map((link) => {
        const active = isClient && (link.exact ? pathname === link.href : pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-[15px] font-medium",
              active ? "bg-leaf text-white" : "text-espresso hover:bg-espresso/5",
            )}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
