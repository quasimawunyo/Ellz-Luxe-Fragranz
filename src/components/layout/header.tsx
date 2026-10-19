"use client";

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

const SHOP = [
  { href: "/shop", label: "All perfumes" },
  { href: "/new", label: "New arrivals" },
  { href: "/sale", label: "Flash sales" },
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
  const [panelTop, setPanelTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-espresso/8 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center sm:size-10 lg:hidden"
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
          <nav className="hidden items-center gap-9 text-[11px] uppercase tracking-[0.32em] text-taupe lg:flex" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-espresso">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center">
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center text-espresso sm:size-10"
              aria-label="Search"
              onClick={() => router.push("/search")}
            >
              <Search className="size-[18px]" strokeWidth={1.75} />
            </button>
            <ThemeToggle className="text-espresso hover:text-champagne" />
            {ready ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="hidden px-2 text-[11px] uppercase tracking-[0.22em] hover:text-champagne lg:inline">
                    Admin
                  </Link>
                ) : null}
                <Link href={signedIn ? "/account" : "/login"} className="grid size-9 shrink-0 place-items-center hover:text-champagne sm:size-10" aria-label={signedIn ? "Account" : "Log in"}>
                  <User className="size-[18px]" strokeWidth={1.75} />
                </Link>
              </>
            ) : (
              <span className="inline-block size-9 sm:size-10" aria-hidden />
            )}
            <SavedHeartLink className="grid size-9 shrink-0 place-items-center hover:text-champagne sm:size-10" />
            <Link href="/cart" className="relative grid size-9 shrink-0 place-items-center sm:size-10" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
              <ShoppingBag className="size-[18px]" strokeWidth={1.75} />
              {ready && cartCount > 0 ? (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-leaf text-[9px] font-medium text-snow">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
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
              placeholder="Search perfumes"
              className="h-12 flex-1 bg-transparent text-sm outline-none"
            />
          </form>
          <div className="mt-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-b border-espresso/10 py-4 font-serif text-3xl"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.28em] text-taupe">Browse</p>
          <div className="mt-2 grid grid-cols-2 gap-x-8">
            {SHOP.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
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
