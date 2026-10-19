import Link from "next/link";
import type { StoreSettings } from "@/lib/catalog/types";
import { BrandLogo } from "@/components/brand/logo";
import { StoreContact, StoreSocials } from "@/components/layout/store-details";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-white pb-20 text-espresso lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="md:grid md:grid-cols-4 md:gap-10">
          <div>
            <BrandLogo className="w-20 md:w-32" size={256} />
            <StoreContact settings={settings} className="mt-4 space-y-1.5 text-sm text-taupe" />
            <StoreSocials settings={settings} />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-x-4 md:col-span-3 md:mt-0 md:gap-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] md:text-xs md:tracking-[0.22em]">Shop</p>
              <ul className="mt-3 space-y-2 text-sm text-taupe">
                <li><Link href="/shop">All products</Link></li>
                <li><Link href="/collections">Collections</Link></li>
                <li><Link href="/new">New arrivals</Link></li>
                <li><Link href="/sale">Flash sales</Link></li>
                <li><Link href="/brands">Brands</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] md:text-xs md:tracking-[0.22em]">Help</p>
              <ul className="mt-3 space-y-2 text-sm text-taupe">
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/track">Track order</Link></li>
                <li><Link href="/legal/shipping">Shipping</Link></li>
                <li><Link href="/legal/returns">Returns</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] md:text-xs md:tracking-[0.22em]">About</p>
              <ul className="mt-3 space-y-2 text-sm text-taupe">
                <li><Link href="/about">Our story</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/legal/privacy">Privacy</Link></li>
                <li><Link href="/legal/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-espresso/10 px-4 py-4 text-center text-xs text-taupe">
        © {new Date().getFullYear()} EllzLuxe Fragranz
      </div>
    </footer>
  );
}
