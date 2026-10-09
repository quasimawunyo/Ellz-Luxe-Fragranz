"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "Our Story" },
];

export function Header({
  cartCount,
  signedIn,
}: {
  cartCount: number;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-ivory/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <button
          type="button"
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <Link href="/" className="font-serif text-lg tracking-[0.06em] sm:text-2xl md:text-3xl">
          Ellz Luxe Fragranz
        </Link>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.2em] lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-champagne">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="size-5" />
          </button>
          <Link href={signedIn ? "/account" : "/login"} aria-label="Account">
            <User className="size-5" />
          </Link>
          <Link href="/cart" className="relative" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
            <ShoppingBag className="size-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center bg-espresso text-[10px] text-ivory">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-espresso/10 px-4 py-4 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-sm uppercase tracking-[0.18em]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
      {searchOpen ? (
        <div className="border-t border-espresso/10 bg-ivory px-4 py-4">
          <form
            className="mx-auto flex max-w-xl gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const q = String(new FormData(event.currentTarget).get("q") ?? "");
              setSearchOpen(false);
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <label className="sr-only" htmlFor="site-search">
              Search fragrances
            </label>
            <input
              id="site-search"
              name="q"
              autoFocus
              placeholder="Search names, notes, or families"
              className="min-h-11 flex-1 border border-espresso/15 bg-white px-3 text-sm"
            />
            <button type="submit" className="bg-espresso px-4 text-sm uppercase tracking-widest text-ivory">
              Search
            </button>
            <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <X />
            </button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
