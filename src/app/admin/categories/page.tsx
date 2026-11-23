import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getAllProductsForAdmin, getCategories } from "@/lib/catalog/queries";

export const metadata = { title: "Categories · Shop desk" };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProductsForAdmin()]);
  const counts = new Map<string, number>();
  for (const product of products) counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">Categories</h1>
      <p className="mt-2 text-sm text-taupe">A category with no bottles on the shop stays out of the menus.</p>
      <ActionForm action={saveCategoryAction} className="mt-6 grid gap-3 rounded-[1.25rem] border border-espresso/10 bg-white p-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-name">Name</Label>
          <Input id="new-name" name="name" required className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="new-slug">Slug</Label>
          <Input id="new-slug" name="slug" placeholder="Filled from the name if you leave this empty" className="min-h-11" />
        </div>
        <Button type="submit" variant="shop" className="min-h-11 sm:col-span-2 sm:w-fit">
          Add category
        </Button>
      </ActionForm>
      <ul className="mt-6 space-y-4">
        {categories.map((category) => {
          const count = counts.get(category.id) ?? 0;
          return (
            <li key={category.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
              <p className="text-sm text-taupe">{count} {count === 1 ? "product" : "products"}</p>
              <ActionForm action={saveCategoryAction} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={category.id} />
                <div>
                  <Label htmlFor={`name-${category.id}`}>Name</Label>
                  <Input id={`name-${category.id}`} name="name" defaultValue={category.name} required className="min-h-11" />
                </div>
                <div>
                  <Label htmlFor={`slug-${category.id}`}>Slug</Label>
                  <Input id={`slug-${category.id}`} name="slug" defaultValue={category.slug} required className="min-h-11" />
                </div>
                <Button type="submit" variant="outline" className="min-h-11 sm:w-fit">
                  Rename
                </Button>
              </ActionForm>
              <ActionForm action={deleteCategoryAction} className="mt-3">
                <input type="hidden" name="id" value={category.id} />
                <Button type="submit" variant="outline" className="min-h-11">
                  Delete
                </Button>
              </ActionForm>
            </li>
          );
        })}
        {!categories.length ? <li className="text-sm text-taupe">No categories yet.</li> : null}
      </ul>
    </div>
  );
}
