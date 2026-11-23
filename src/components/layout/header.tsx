"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { SavedHeartLink } from "@/components/layout/saved-heart-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BrandLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export type HeaderSearchHit = {
  slug: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  text: string;
};

const SHOP = [
  { href: "/shop", label: "All perfumes" },
  { href: "/new", label: "New arrivals" },
  { href: "/sale", label: "Flash sales" },
  { href: "/brands", label: "Brands" },
  { href: "/collections/womens-fragrances", label: "Women" },
  { href: "/collections/mens-fragrances", label: "Men" },
  { href: "/collections/unisex-fragrances", label: "Unisex" },
  { href: "/collections/gift-and-discovery-sets", label: "Gifts" },
  { href: "/track", label: "Track order" },
];

export function Header({
  cartCount,
  signedIn,
  isAdmin = false,
  ready = true,
  showSale = false,
  showGifts = false,
  searchHits = [],
}: {
  cartCount: number;
  signedIn: boolean;
  isAdmin?: boolean;
  ready?: boolean;
  showSale?: boolean;
  showGifts?: boolean;
  searchHits?: HeaderSearchHit[];
}) {
  const shopLinks = SHOP.filter((link) => {
    if (link.href === "/sale") return showSale;
    if (link.href === "/collections/gift-and-discovery-sets") return showGifts;
    return true;
  });
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [panelTop, setPanelTop] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }

  const needle = searchQuery.trim().toLowerCase();
  const matches = needle ? searchHits.filter((hit) => hit.text.includes(needle)).slice(0, 8) : [];

  useEffect(() => {
    if (!searchOpen) return;
    searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!open) return;
    const measure = () => setPanelTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
    measure();
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", measure);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-espresso/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => {
                setPanelTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
                setOpen((value) => !value);
              }}
            >
              {open ? <X className="size-[18px]" strokeWidth={1.75} /> : <Menu className="size-[18px]" strokeWidth={1.75} />}
            </button>
            <BrandLogo className="ml-1 w-[3.75rem] shrink-0 sm:ml-0 sm:w-24 md:w-28" size={224} priority />
          </div>
          <nav className="hidden items-center gap-8 text-sm text-taupe lg:flex" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} prefetch className="inline-flex min-h-11 items-center hover:text-espresso">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center text-espresso"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search className="size-[18px]" strokeWidth={1.75} />
            </button>
            <ThemeToggle className="text-espresso hover:text-champagne" />
            {ready ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="hidden px-2 text-sm hover:text-espresso lg:inline">
                    Admin
                  </Link>
                ) : null}
                <Link href={signedIn ? "/account" : "/login"} className="grid size-11 shrink-0 place-items-center hover:text-champagne" aria-label={signedIn ? "Account" : "Log in"}>
                  <User className="size-[18px]" strokeWidth={1.75} />
                </Link>
              </>
            ) : (
              <span className="inline-block size-11" aria-hidden />
            )}
            <SavedHeartLink className="grid size-11 shrink-0 place-items-center hover:text-champagne" />
            <Link href="/cart" className="relative grid size-11 shrink-0 place-items-center" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
              <ShoppingBag className="size-[18px]" strokeWidth={1.75} />
              {ready && cartCount > 0 ? (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-leaf text-[9px] font-medium text-snow">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
        {searchOpen ? (
          <div className="border-t border-espresso/10 bg-white">
            <form
              className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                setSearchOpen(false);
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
              }}
            >
              <Search className="size-4 text-taupe" />
              <label className="sr-only" htmlFor="site-search">
                Search products
              </label>
              <input
                ref={searchRef}
                id="site-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search perfumes"
                autoComplete="off"
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
            </form>
            {needle ? <SearchMatches matches={matches} query={searchQuery} onPick={() => setSearchOpen(false)} /> : null}
          </div>
        ) : null}
      </header>
      {open ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-[60] overflow-y-auto bg-ivory px-6 pb-10 pt-6 lg:hidden"
          style={{ top: panelTop }}
          aria-label="Menu"
        >
          <form
            className="flex items-center gap-3 rounded-full border border-espresso/15 bg-white px-5"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }}
          >
            <Search className="size-4 text-taupe" />
            <label className="sr-only" htmlFor="site-search-mobile">
              Search products
            </label>
            <input
              id="site-search-mobile"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search perfumes"
              autoComplete="off"
              className="h-12 flex-1 bg-transparent text-sm outline-none"
            />
          </form>
          {needle ? <SearchMatches matches={matches} query={searchQuery} onPick={() => setOpen(false)} /> : null}
          <div className="mt-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="block border-b border-espresso/10 py-4 text-base"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-10 text-sm text-taupe">Browse</p>
          <div className="mt-2 grid grid-cols-2 gap-x-8">
            {shopLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                prefetch
                className="border-b border-espresso/10 py-3 text-sm"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {isAdmin ? (
            <Link href="/admin" className="mt-6 block py-3 text-sm" onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
        </nav>
      ) : null}
      {ready ? <MobileNav cartCount={cartCount} signedIn={signedIn} /> : null}
    </>
  );
}

function SearchMatches({
  matches,
  query,
  onPick,
}: {
  matches: HeaderSearchHit[];
  query: string;
  onPick: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-4" aria-live="polite">
      {matches.length ? (
        <ul className="divide-y divide-espresso/10 border border-espresso/10 bg-white">
          {matches.map((hit) => (
            <li key={hit.slug}>
              <Link href={`/product/${hit.slug}`} prefetch className="flex items-center gap-3 px-3 py-2" onClick={onPick}>
                <span className="relative size-12 shrink-0 overflow-hidden bg-espresso/5">
                  {hit.imageUrl ? <Image src={hit.imageUrl} alt="" fill className="object-cover" sizes="48px" /> : null}
                </span>
                <span>
                  <span className="block text-sm font-medium">{hit.name}</span>
                  <span className="block text-xs text-taupe">{hit.brand}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-taupe">No matches for {query.trim()}.</p>
      )}
    </div>
  );
}
