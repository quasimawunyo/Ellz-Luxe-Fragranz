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
            Accessible luxury fragrance, composed for personality, confidence, and quiet elegance.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Policies</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/legal/shipping">Shipping</Link></li>
            <li><Link href="/legal/returns">Returns</Link></li>
            <li><Link href="/legal/privacy">Privacy</Link></li>
            <li><Link href="/legal/terms">Terms</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Stay close</p>
          <p className="mt-4 text-sm text-ivory/70">{settings.contactEmail}</p>
          <p className="text-sm text-ivory/70">{settings.contactPhone}</p>
          <a className="mt-2 inline-block text-sm text-champagne" href={settings.instagramUrl}>
            Instagram
          </a>
          <NewsletterForm compact />
        </div>
      </div>
    </footer>
  );
}
