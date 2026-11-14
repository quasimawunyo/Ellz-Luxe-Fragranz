import Link from "next/link";
import { TrackLookup } from "@/components/orders/track-lookup";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Track order",
  description: "Look up an EllzLuxe Fragranz order with the phone from checkout or the order number.",
  path: "/track",
});

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Track order</h1>
      <p className="mt-4 text-sm leading-6 text-taupe">Phone number from checkout, or your order number (ELF-…).</p>
      <TrackLookup />
      <p className="mt-8 text-sm text-taupe">
        Have an account? <Link href="/account/orders">Order history</Link>
      </p>
    </div>
  );
}
