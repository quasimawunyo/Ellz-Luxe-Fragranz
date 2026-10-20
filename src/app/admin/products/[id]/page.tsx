import Image from "next/image";
import { getCategories, getProductById } from "@/lib/catalog/queries";
import { saveProductAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sellingVariant } from "@/lib/catalog/helpers";
import { cedisInputFromMinor, formatMoney } from "@/lib/money";
import { notFound } from "next/navigation";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const product = isNew ? null : await getProductById(id);
  if (!isNew && !product) notFound();
  const categories = await getCategories();
  const variant = product ? sellingVariant(product) ?? product.variants[0] : undefined;
  const otherVariants = product?.variants.filter((item) => item.id !== variant?.id) ?? [];
  const image = product?.images[0];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">{isNew ? "New product" : product?.name}</h1>
      <p className="mt-2 text-sm text-taupe">
        Prices are Ghana cedis. Saving requires a Supabase service role. Leave tester unchecked for bottles you sell.
      </p>
      <ActionForm action={saveProductAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="variantId" value={variant?.id ?? ""} />
        <input type="hidden" name="imageId" value={image?.id ?? ""} />
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
          <Input id="brand" name="brand" defaultValue={product?.brand ?? "EllzLuxe Fragranz"} required />
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
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} className="size-5" /> Featured
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="newArrival"
            defaultChecked={isNew ? true : product?.newArrival}
            className="size-5"
          />{" "}
          New arrival
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="isDemonstration" defaultChecked={product?.isDemonstration ?? false} className="size-5" />
          Tester (not for sale)
        </label>
        <div>
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={product?.status ?? "published"} className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <h2 className="pt-4 font-serif text-2xl">Photo</h2>
        {image ? (
          <div className="relative h-40 w-32 overflow-hidden bg-espresso/5">
            <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="128px" />
          </div>
        ) : null}
        <div>
          <Label htmlFor="imageFile">Upload photo</Label>
          <Input id="imageFile" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div>
          <Label htmlFor="imageUrl">Or image URL</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={image?.url ?? ""} />
        </div>
        <div>
          <Label htmlFor="imageAlt">Image description</Label>
          <Input id="imageAlt" name="imageAlt" defaultValue={image?.alt ?? ""} />
        </div>
        <h2 className="pt-4 font-serif text-2xl">Size on the shop</h2>
        {otherVariants.length ? (
          <div className="text-sm text-taupe">
            <p>This form saves the size shown on the shop. Other sizes stay as they are:</p>
            <ul className="mt-2 space-y-1">
              {otherVariants.map((item) => (
                <li key={item.id}>
                  {item.label} · {formatMoney(item.priceMinor)} · {item.stock} left
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
          <Label htmlFor="priceCedis">Price (GH₵)</Label>
          <Input
            id="priceCedis"
            name="priceCedis"
            type="number"
            min="0"
            step="0.01"
            defaultValue={variant ? cedisInputFromMinor(variant.priceMinor) : "0.00"}
            required
          />
        </div>
        <div>
          <Label htmlFor="compareAtCedis">Compare-at (GH₵)</Label>
          <Input
            id="compareAtCedis"
            name="compareAtCedis"
            type="number"
            min="0"
            step="0.01"
            defaultValue={variant?.compareAtMinor != null ? cedisInputFromMinor(variant.compareAtMinor) : ""}
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={variant?.stock ?? 0} />
        </div>
        <Button type="submit" className="w-full sm:w-auto">Save</Button>
      </ActionForm>
    </div>
  );
}
