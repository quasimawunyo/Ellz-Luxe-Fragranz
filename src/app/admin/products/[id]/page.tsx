import type { Metadata } from "next";
import Image from "next/image";
import { getCategories, getProductById } from "@/lib/catalog/queries";
import { saveProductAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SizeRows, type SizeRow } from "@/components/admin/size-rows";
import { cedisInputFromMinor } from "@/lib/money";
import { createServiceClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (id === "new") return { title: "New product · Shop desk" };
  const product = await getProductById(id);
  return { title: `${product?.name ?? "Edit product"} · Shop desk` };
}

export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const isNew = id === "new";
  const product = isNew ? null : await getProductById(id);
  if (!isNew && !product) notFound();
  const categories = await getCategories();
  const image = product?.images[0];
  const orderedIds = new Set<string>();
  if (product?.variants.length) {
    const admin = createServiceClient();
    if (admin) {
      const { data } = await admin.from("order_items").select("variant_id").in(
        "variant_id",
        product.variants.map((item) => item.id),
      );
      for (const row of data ?? []) {
        if (row.variant_id) orderedIds.add(row.variant_id);
      }
    }
  }
  const sizeRows: SizeRow[] = (product?.variants ?? [])
    .slice()
    .sort((a, b) => (a.sizeMl ?? 0) - (b.sizeMl ?? 0))
    .map((item) => ({
      id: item.id,
      sizeMl: item.sizeMl == null ? "" : String(item.sizeMl),
      priceCedis: cedisInputFromMinor(item.priceMinor),
      compareAtCedis: item.compareAtMinor != null ? cedisInputFromMinor(item.compareAtMinor) : "",
      sku: item.sku,
      visible: item.visible !== false,
      ordered: orderedIds.has(item.id),
      stockQuantity: String(item.stockQuantity ?? 0),
      trackStock: item.trackStock,
      costCedis: item.costPriceMinor != null ? cedisInputFromMinor(item.costPriceMinor) : "",
      lowStockThreshold: item.lowStockThreshold == null ? "" : String(item.lowStockThreshold),
    }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">{isNew ? "New product" : product?.name}</h1>
      <p className="mt-2 text-sm text-taupe">
        Prices are Ghana cedis. Leave tester unchecked for bottles you sell.
      </p>
      {notice === "photo" ? (
        <p role="status" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          Product saved. Add a photo before this bottle goes on the shop.
        </p>
      ) : null}
      <ActionForm action={saveProductAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="id" value={product?.id ?? ""} />
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
        <SizeRows initial={sizeRows} />
        <Button type="submit" className="w-full sm:w-auto">Save</Button>
      </ActionForm>
    </div>
  );
}
