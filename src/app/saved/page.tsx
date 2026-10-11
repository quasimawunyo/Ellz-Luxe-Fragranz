import { SavedShelves } from "@/components/saved/saved-shelves";
import { getPublishedProducts } from "@/lib/catalog/queries";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const products = await getPublishedProducts();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-serif text-4xl">Saved</h1>
      <p className="mt-3 max-w-xl text-taupe">Likes live on this device. Restock notices need an email.</p>
      <div className="mt-10">
        <SavedShelves products={products} />
      </div>
    </div>
  );
}
