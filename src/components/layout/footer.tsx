import Link from "next/link";
import type { StoreSettings } from "@/lib/catalog/types";
import { BrandLogo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { StoreContact, StoreSocials } from "@/components/layout/store-details";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-auto border-t border-white/10 bg-rich text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <BrandLogo className="w-32" size={256} />
          <p className="mt-4 text-sm leading-6 text-ivory/70">Perfume boutique at Ells Luxe Annex.</p>
          <p className="mt-6 text-sm font-medium text-ivory">Visit</p>
          <StoreContact settings={settings} className="mt-3 space-y-2 text-sm text-ivory/80" />
          <p className="mt-6 text-sm font-medium text-ivory">Social</p>
          <StoreSocials settings={settings} />
        </div>
        <div>
          <p className="text-sm font-medium text-ivory">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/shop">All perfumes</Link></li>
            <li><Link href="/brands">Brands</Link></li>
            <li><Link href="/collections/womens-fragrances">Women</Link></li>
            <li><Link href="/collections/mens-fragrances">Men</Link></li>
            <li><Link href="/collections/unisex-fragrances">Unisex</Link></li>
            <li><Link href="/collections/gift-and-discovery-sets">Gifts</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-ivory">Help</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/account">Account</Link></li>
            <li><Link href="/legal/shipping">Shipping</Link></li>
            <li><Link href="/legal/returns">Returns</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-ivory">Legal</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/legal/privacy">Privacy</Link></li>
            <li><Link href="/legal/terms">Terms</Link></li>
          </ul>
          <p className="mt-8 text-sm font-medium text-ivory">Email updates</p>
          <NewsletterForm compact />
        </div>
      </div>
    </footer>
  );
}
