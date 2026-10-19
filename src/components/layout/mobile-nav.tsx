"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingBag, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav({
  cartCount,
  signedIn,
}: {
  cartCount: number;
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: Home, current: pathname === "/" },
    { href: "/shop", label: "Shop", icon: Store, current: pathname.startsWith("/shop") || pathname.startsWith("/product") },
    { href: "/cart", label: "Cart", icon: ShoppingBag, current: pathname.startsWith("/cart") || pathname.startsWith("/checkout"), count: cartCount },
    { href: "/saved", label: "Saved", icon: Heart, current: pathname.startsWith("/saved") },
    { href: signedIn ? "/account" : "/login", label: "Account", icon: User, current: pathname.startsWith("/account") || pathname.startsWith("/login") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-espresso/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                prefetch
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] tracking-wide",
                  item.current ? "text-espresso" : "text-taupe",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={1.6} />
                  {item.count ? (
                    <span className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-leaf text-[9px] text-snow">
                      {item.count}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
