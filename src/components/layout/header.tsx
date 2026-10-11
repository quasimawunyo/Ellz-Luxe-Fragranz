"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { SavedHeartLink } from "@/components/layout/saved-heart-link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "About" },
];

const SHOP = [
  { href: "/collections/womens-fragrances", label: "Women" },
  { href: "/collections/mens-fragrances", label: "Men" },
  { href: "/collections/unisex-fragrances", label: "Unisex" },
  { href: "/collections/gift-and-discovery-sets", label: "Gifts" },
  { href: "/shop", label: "All perfumes" },
  { href: "/brands", label: "Brands" },
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
  const [shopOpen, setShopOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <BrandLogo className="w-[4.5rem] sm:w-24 md:w-28" size={224} priority />
        <nav className="hidden items-center gap-7 text-sm lg:flex">
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
                  <div className="absolute left-0 top-full z-50 mt-3 min-w-48 border border-espresso/10 bg-white py-2 shadow-sm">
                    {SHOP.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="block px-4 py-2 text-sm hover:bg-ivory"
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
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <form
            className="hidden items-center gap-2 border-b border-espresso/20 md:flex"
            onSubmit={(event) => {
              event.preventDefault();
              const q = String(new FormData(event.currentTarget).get("q") ?? "");
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <Search className="size-4 text-taupe" />
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              placeholder="Search"
              className="h-9 w-36 bg-transparent text-sm outline-none placeholder:text-taupe lg:w-48"
            />
          </form>
          {ready ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className="hidden text-sm hover:text-champagne lg:inline">
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
          <Link href="/saved" className="mt-1 block py-2.5 text-sm" onClick={() => setOpen(false)}>
            Saved
          </Link>
          <Link
            href={signedIn ? "/account" : "/login"}
            className="mt-1 block py-2.5 text-sm"
            onClick={() => setOpen(false)}
          >
            {signedIn ? "Account" : "Log in"}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
