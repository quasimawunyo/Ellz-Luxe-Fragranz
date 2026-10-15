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
      <p className="mt-3 max-w-xl text-taupe">
        Shop by family — citrus, floral, woody, oud — then open a bottle for notes and sizes.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`} className="group relative min-h-80 overflow-hidden rounded-[1.75rem]">
            <Image src={collection.imageUrl} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-rich/45" />
            <div className="absolute bottom-6 left-6 right-6 text-ivory">
              <h2 className="font-serif text-4xl">{collection.name}</h2>
              <p className="mt-2 max-w-md text-sm text-ivory/80">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
