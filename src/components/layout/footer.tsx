import Link from "next/link";
import type { StoreSettings } from "@/lib/catalog/types";
import { BrandLogo } from "@/components/brand/logo";
import { StoreContact, StoreSocials } from "@/components/layout/store-details";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-white text-espresso">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4">
        <div>
          <BrandLogo className="w-32" size={256} />
          <p className="mt-4 text-sm leading-6 text-taupe">Perfume boutique · Testers marked Tester</p>
          <p className="mt-2 text-sm text-taupe">{settings.location}</p>
          <StoreContact settings={settings} className="mt-5 space-y-2 text-sm text-taupe" />
          <StoreSocials settings={settings} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-taupe">
            <li><Link href="/shop">All products</Link></li>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/new">New arrivals</Link></li>
            <li><Link href="/brands">Brands</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">Help</p>
          <ul className="mt-4 space-y-2 text-sm text-taupe">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/track">Track order</Link></li>
            <li><Link href="/legal/shipping">Shipping</Link></li>
            <li><Link href="/legal/returns">Returns</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">About</p>
          <ul className="mt-4 space-y-2 text-sm text-taupe">
            <li><Link href="/about">Our story</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/legal/privacy">Privacy</Link></li>
            <li><Link href="/legal/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-espresso/10 px-4 py-5 text-center text-xs text-taupe">
        © {new Date().getFullYear()} EllzLuxe Fragranz
      </div>
    </footer>
  );
}
