import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCollections } from "@/lib/catalog/queries";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Collections" }]} />
      <h1 className="mt-6 font-serif text-4xl">Collections</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[1.75rem]">
            <Image
              src={collection.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-rich/45" />
            <div className="absolute inset-x-3 bottom-3 text-snow sm:inset-x-5 sm:bottom-5">
              <h2 className="font-serif text-xl leading-tight sm:text-3xl">{collection.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-snow/80 sm:text-sm">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
