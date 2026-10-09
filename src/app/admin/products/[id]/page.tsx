import { getCategories, getProductById } from "@/lib/catalog/queries";
import { saveProductAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { notFound } from "next/navigation";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const product = isNew ? null : await getProductById(id);
  if (!isNew && !product) notFound();
  const categories = await getCategories();
  const variant = product?.variants[0];

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">{isNew ? "New product" : product?.name}</h1>
      <p className="mt-2 text-sm text-taupe">
        Saving requires a Supabase service role. Catalog demonstration data is read-only without it.
      </p>
      <ActionForm action={saveProductAction} className="mt-8 space-y-4">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="variantId" value={variant?.id ?? ""} />
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} required />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={product?.brand ?? "Ellz Luxe Fragranz"} required />
        </div>
        <div>
          <Label htmlFor="concentration">Concentration</Label>
          <Input id="concentration" name="concentration" defaultValue={product?.concentration ?? ""} />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId} className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={product?.description} required />
        </div>
        <div>
          <Label htmlFor="topNotes">Top notes</Label>
          <Input id="topNotes" name="topNotes" defaultValue={product?.notes.top.join(", ")} />
        </div>
        <div>
          <Label htmlFor="heartNotes">Heart notes</Label>
          <Input id="heartNotes" name="heartNotes" defaultValue={product?.notes.heart.join(", ")} />
        </div>
        <div>
          <Label htmlFor="baseNotes">Base notes</Label>
          <Input id="baseNotes" name="baseNotes" defaultValue={product?.notes.base.join(", ")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
        </label>
        <div>
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={product?.status ?? "draft"} className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <h2 className="pt-4 font-serif text-2xl">Primary variant</h2>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={variant?.sku} />
        </div>
        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" defaultValue={variant?.label} />
        </div>
        <div>
          <Label htmlFor="sizeMl">Size (ml)</Label>
          <Input id="sizeMl" name="sizeMl" type="number" defaultValue={variant?.sizeMl ?? ""} />
        </div>
        <div>
          <Label htmlFor="priceMinor">Price (pesewas)</Label>
          <Input id="priceMinor" name="priceMinor" type="number" defaultValue={variant?.priceMinor ?? 0} />
        </div>
        <div>
          <Label htmlFor="compareAtMinor">Compare-at (pesewas)</Label>
          <Input id="compareAtMinor" name="compareAtMinor" type="number" defaultValue={variant?.compareAtMinor ?? ""} />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={variant?.stock ?? 0} />
        </div>
        <Button type="submit">Save</Button>
      </ActionForm>
    </div>
  );
}
