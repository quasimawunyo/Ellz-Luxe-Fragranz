"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { SavedHeartLink } from "@/components/layout/saved-heart-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SHOP = [
  { href: "/shop", label: "All perfumes" },
  { href: "/new", label: "New arrivals" },
  { href: "/brands", label: "Brands" },
  { href: "/collections/womens-fragrances", label: "Women" },
  { href: "/collections/mens-fragrances", label: "Men" },
  { href: "/collections/unisex-fragrances", label: "Unisex" },
  { href: "/collections/gift-and-discovery-sets", label: "Gifts" },
];

export function Header({
  cartCount,
  signedIn,
  isAdmin = false,
  ready = true,
}: {
  cartCount: number;
  signedIn: boolean;
  isAdmin?: boolean;
  ready?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-espresso/8 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X /> : <Menu />}
            </button>
            <BrandLogo className="ml-2 w-[4.25rem] sm:ml-0 sm:w-24 md:w-28" size={224} priority />
          </div>
          <nav className="hidden items-center gap-9 text-[11px] uppercase tracking-[0.32em] text-taupe lg:flex" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-espresso">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <button
              type="button"
              className="hidden text-espresso md:inline"
              aria-label="Search"
              onClick={() => router.push("/search")}
            >
              <Search className="size-5" />
            </button>
            {ready ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="hidden text-[11px] uppercase tracking-[0.22em] hover:text-champagne lg:inline">
                    Admin
                  </Link>
                ) : null}
                <Link href={signedIn ? "/account" : "/login"} className="hover:text-champagne" aria-label={signedIn ? "Account" : "Log in"}>
                  <User className="size-5" />
                </Link>
              </>
            ) : (
              <span className="inline-block size-5" aria-hidden />
            )}
            <SavedHeartLink className="hover:text-champagne" />
            <Link href="/cart" className="relative" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
              <ShoppingBag className="size-5" />
              {ready && cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-espresso text-[10px] font-medium text-ivory">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
        {open ? (
          <nav className="border-t border-espresso/10 px-4 py-3 lg:hidden">
            <form
              className="mb-3 flex items-center gap-2 border-b border-espresso/15 pb-2"
              onSubmit={(event) => {
                event.preventDefault();
                const q = String(new FormData(event.currentTarget).get("q") ?? "");
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }}
            >
              <Search className="size-4 text-taupe" />
              <label className="sr-only" htmlFor="site-search-mobile">
                Search products
              </label>
              <input
                id="site-search-mobile"
                name="q"
                placeholder="Search"
                className="h-10 flex-1 bg-transparent text-sm outline-none"
              />
            </form>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block py-2.5 text-sm" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {SHOP.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="block py-1.5 pl-3 text-sm text-taupe"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link href="/admin" className="mt-2 block py-2.5 text-sm" onClick={() => setOpen(false)}>
                Admin
              </Link>
            ) : null}
          </nav>
        ) : null}
      </header>
      {ready ? <MobileNav cartCount={cartCount} signedIn={signedIn} /> : null}
    </>
  );
}
