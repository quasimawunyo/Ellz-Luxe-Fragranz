import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { FlashSales, picturesForFlashSales } from "@/components/home/flash-sales";
import { HeroAnnouncement } from "@/components/home/hero-announcement";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { primaryImage, stockedCollections, takeUniqueBottles, unusedPicture } from "@/lib/catalog/helpers";
import { getCollections, getDiscountedProducts, getFeaturedProducts, getNewArrivals, getPublishedProducts, getStoreSettings } from "@/lib/catalog/queries";
import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { PAGE_DESCRIPTIONS } from "@/lib/seo-copy";
import { ghanaWaDigits } from "@/lib/whatsapp";

export const metadata = pageMetadata({
  description: PAGE_DESCRIPTIONS.home,
  path: "/",
});

export default async function HomePage() {
  const [featured, discounted, arrivals, collections, settings, published, nonce] = await Promise.all([
    getFeaturedProducts(),
    getDiscountedProducts(),
    getNewArrivals(),
    getCollections(),
    getStoreSettings(),
    getPublishedProducts(),
    headers().then((value) => value.get("x-nonce") ?? undefined),
  ]);
  const categoryOrder = ["col-women", "col-men", "col-unisex", "col-gifts"];
  const stockedIds = new Set(stockedCollections(collections, published).map((collection) => collection.id));
  const shopBy = categoryOrder.flatMap((id) => collections.filter((collection) => collection.id === id && stockedIds.has(collection.id)));
  const telephone = ghanaWaDigits(settings.contactPhone);
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "EllzLuxe Fragranz",
    url: env.siteUrl,
    image: `${env.siteUrl}/images/story.jpg`,
    telephone: telephone.startsWith("233") ? `+${telephone}` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ells Luxe Annex",
      addressLocality: "Pantang",
      addressCountry: "GH",
    },
  };
  const seenIds = new Set<string>();
  const seenPictures = new Set<string>();
  const pictureOf = (product: (typeof arrivals)[number]) => primaryImage(product)?.url;
  const arrivalCards = takeUniqueBottles(arrivals, seenIds, seenPictures, pictureOf, 8);
  const bestCards = takeUniqueBottles(featured, seenIds, seenPictures, pictureOf);
  const flash = takeUniqueBottles(picturesForFlashSales(discounted, discounted.length), seenIds, seenPictures, pictureOf);
  const categoryCovers = shopBy.map((collection) => ({
    collection,
    imageUrl: unusedPicture(
      [
        collection.imageUrl,
        ...published
          .filter((product) => product.collectionIds.includes(collection.id))
          .map((product) => primaryImage(product)?.url),
      ],
      seenPictures,
    ),
  }));

  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <HomeHero />
      <HeroAnnouncement location={settings.location} phone={settings.contactPhone} />

      <section className="bg-white px-4 py-12" aria-label="New arrivals">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">New arrivals</h2>
            <Link href="/new" className="inline-flex min-h-11 shrink-0 items-center text-sm text-taupe hover:text-espresso">
              View all
            </Link>
          </div>
          {arrivalCards.length ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {arrivalCards.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-ivory px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">Shop by category</h2>
            <Link href="/collections" className="inline-flex min-h-11 shrink-0 items-center text-sm text-taupe hover:text-espresso">
              All categories
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categoryCovers.map(({ collection, imageUrl }) => (
              <Link key={collection.id} href={`/collections/${collection.slug}`} prefetch className="min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-espresso/5">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <span className="mt-3 block font-serif text-lg leading-tight">{collection.name.replace(" fragrances", "")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-3xl">Best sellers</h2>
          <div className="mt-10">
            <ProductGrid products={bestCards} viewAllHref="/shop" className="grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:gap-y-12" />
          </div>
        </div>
      </section>

      {flash.length ? (
        <section className="bg-white px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl">Flash sales</h2>
              <Link href="/sale" className="shrink-0 text-sm text-taupe hover:text-espresso">
                View all
              </Link>
            </div>
            <div className="mt-8">
              <FlashSales products={flash} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-4 py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] bg-espresso/5">
            <Image
              src="/images/story.jpg"
              alt="Two perfume bottles on linen"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl">About</h2>
            <p className="mt-4 max-w-md leading-7 text-taupe">{settings.aboutStory}</p>
            <Link href="/about" className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
              About us
            </Link>
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
