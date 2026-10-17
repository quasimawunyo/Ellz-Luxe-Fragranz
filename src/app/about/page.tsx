import Image from "next/image";
import Link from "next/link";
import { StoreContact } from "@/components/layout/store-details";
import { buttonVariants } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/catalog/queries";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const wa = whatsappHref(settings.contactPhone, "Hello, I have a question about EllzLuxe Fragranz.");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 leading-8">
      <h1 className="font-serif text-4xl md:text-5xl">About</h1>
      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-espresso/5">
        <Image
          src="/images/story.jpg"
          alt="Perfume bottles"
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-10">
        <p>{settings.aboutStory}</p>
        <p className="mt-6">{settings.shippingNote}</p>
        <p className="mt-6">Delivery is between 24-72 hours.</p>
        <StoreContact settings={settings} className="mt-8 space-y-2 text-sm text-taupe" />
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop" className={cn(buttonVariants({ variant: "gold" }))}>
            Shop
          </Link>
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }))}>
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
