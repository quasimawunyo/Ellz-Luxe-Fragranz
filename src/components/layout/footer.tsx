import Link from "next/link";
import type { StoreSettings } from "@/lib/catalog/types";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-rich text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl">Ellz Luxe Fragranz</p>
          <p className="mt-4 text-sm leading-7 text-ivory/70">
            Accessible luxury fragrance for personality, confidence, and quiet elegance.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-champagne">Find us</p>
          <p className="mt-3 text-sm text-ivory/80">{settings.contactEmail}</p>
          <p className="text-sm text-ivory/80">{settings.contactPhone}</p>
          <a className="mt-2 inline-block text-sm text-champagne" href={settings.instagramUrl}>
            Instagram
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/shop">All perfumes</Link></li>
            <li><Link href="/collections/womens-fragrances">Women</Link></li>
            <li><Link href="/collections/mens-fragrances">Men</Link></li>
            <li><Link href="/collections/unisex-fragrances">Unisex</Link></li>
            <li><Link href="/collections/gift-and-discovery-sets">Gifts</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Customer</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/account">My account</Link></li>
            <li><Link href="/legal/shipping">Shipping</Link></li>
            <li><Link href="/legal/returns">Returns</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Legal</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/legal/privacy">Privacy</Link></li>
            <li><Link href="/legal/terms">Terms</Link></li>
          </ul>
          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-champagne">Stay close</p>
          <NewsletterForm compact />
        </div>
      </div>
    </footer>
  );
}
