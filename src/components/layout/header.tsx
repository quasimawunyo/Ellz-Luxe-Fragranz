"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "Our Story" },
];

const SHOP = [
  { href: "/collections/womens-fragrances", label: "Women" },
  { href: "/collections/mens-fragrances", label: "Men" },
  { href: "/collections/unisex-fragrances", label: "Unisex" },
  { href: "/collections/gift-and-discovery-sets", label: "Gifts" },
  { href: "/shop", label: "All perfumes" },
  { href: "/brands", label: "Our brands" },
];

export function Header({
  cartCount,
  signedIn,
  isAdmin = false,
}: {
  cartCount: number;
  signedIn: boolean;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-champagne/25 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <button
          type="button"
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <BrandLogo className="w-20 sm:w-24 md:w-28" size={224} priority />
        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.22em] lg:flex">
          {NAV.map((item) =>
            item.label === "Shop" ? (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-champagne"
                  aria-expanded={shopOpen}
                  onClick={() => setShopOpen((value) => !value)}
                >
                  Shop <ChevronDown className="size-3.5" />
                </button>
                {shopOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-4 min-w-52 border border-champagne/30 bg-ivory py-3 shadow-[0_20px_50px_rgba(18,36,24,0.08)]">
                    {SHOP.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="block px-5 py-2 text-[11px] uppercase tracking-[0.18em] hover:text-champagne"
                        onClick={() => setShopOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="hover:text-champagne">
                {item.label}
              </Link>
            ),
          )}
          {isAdmin ? (
            <Link href="/admin" className="hover:text-champagne">
              Admin
            </Link>
          ) : null}
          <Link href={signedIn ? "/account" : "/login"} className="hover:text-champagne">
            {signedIn ? "Account" : "Login / Register"}
          </Link>
        </nav>
        <Link href="/cart" className="relative" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
          <ShoppingBag className="size-5" />
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-champagne text-[10px] font-semibold text-espresso">
            {cartCount}
          </span>
        </Link>
      </div>
      <div className="border-t border-champagne/20 px-4 py-3">
        <form
          className="mx-auto flex max-w-7xl items-center gap-3 border-b border-espresso/15 px-1"
          onSubmit={(event) => {
            event.preventDefault();
            const q = String(new FormData(event.currentTarget).get("q") ?? "");
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search className="size-4 text-taupe" />
          <label className="sr-only" htmlFor="site-search">
            Search fragrances
          </label>
          <input
            id="site-search"
            name="q"
            placeholder="Find your perfume…"
            className="min-h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-taupe"
          />
          <button type="submit" className="text-[11px] uppercase tracking-[0.22em] text-espresso">
            Search
          </button>
        </form>
      </div>
      {open ? (
        <nav className="border-t border-champagne/20 px-4 py-4 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-[11px] uppercase tracking-[0.22em]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {SHOP.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="block py-2 pl-3 text-sm text-taupe"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href="/admin"
              className="mt-2 block py-3 text-[11px] uppercase tracking-[0.22em]"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          ) : null}
          <Link
            href={signedIn ? "/account" : "/login"}
            className="mt-2 flex items-center gap-2 py-3 text-[11px] uppercase tracking-[0.22em]"
            onClick={() => setOpen(false)}
          >
            <User className="size-4" />
            {signedIn ? "Account" : "Login / Register"}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
