import Link from "next/link";
import { getAllProductsForAdmin, getCategories } from "@/lib/catalog/queries";

export const metadata = { title: "Categories · Shop desk" };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProductsForAdmin()]);
  const counts = new Map<string, number>();
  for (const product of products) counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">Categories</h1>
      <p className="mt-2 text-sm text-taupe">The shelves already on the shop. Open a product to move it.</p>
      <ul className="mt-6 divide-y divide-espresso/10 rounded-[1.25rem] border border-espresso/10 bg-white">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-4">
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-taupe">{counts.get(category.id) ?? 0} products</p>
            </div>
            <Link href="/admin/products" className="text-sm text-leaf">
              Edit products
            </Link>
          </li>
        ))}
        {!categories.length ? <li className="px-4 py-8 text-sm text-taupe">No categories yet.</li> : null}
      </ul>
    </div>
  );
}
