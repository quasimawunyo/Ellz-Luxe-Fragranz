import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getVariantById } from "@/lib/catalog/queries";
import { createServiceClient } from "@/lib/supabase/admin";
import { adjustStockAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";
import { stockState } from "@/lib/stock";
import { StockBadge } from "@/components/admin/stock-badge";

export const metadata = { title: "Adjust stock · Admin" };

const REASONS = [
  ["restock", "Restock"],
  ["correction", "Correction"],
  ["damaged", "Damaged"],
  ["returned", "Returned"],
] as const;

export default async function AdjustStockPage({ params }: { params: Promise<{ variantId: string }> }) {
  await requireAdmin();
  const { variantId } = await params;
  const match = await getVariantById(variantId);
  if (!match) notFound();
  const admin = createServiceClient();
  const { data: movements } = admin
    ? await admin
        .from("stock_movements")
        .select("id, change, reason, note, created_at")
        .eq("variant_id", variantId)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-sm text-taupe hover:text-espresso">
        Products
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">{match.product.name}</h1>
      <p className="mt-2 text-sm text-taupe">
        {match.product.brand} · {match.variant.label} · {formatMoney(match.variant.priceMinor)}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <p className="font-serif text-3xl">{match.variant.trackStock ? match.variant.stockQuantity : "—"}</p>
        <StockBadge state={stockState(match.variant)} />
      </div>
      {!match.variant.trackStock ? (
        <p className="mt-3 text-sm text-taupe">
          This size is not tracked yet, so the shop still sells it.{" "}
          <Link href="/admin/products/opening" className="text-leaf underline underline-offset-4">
            Set opening stock
          </Link>
        </p>
      ) : null}

      <ActionForm action={adjustStockAction} className="mt-8 space-y-4 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <input type="hidden" name="variantId" value={match.variant.id} />
        <h2 className="font-serif text-2xl">Adjust stock</h2>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" min={1} step={1} required />
        </div>
        <div>
          <Label htmlFor="direction">Add or remove</Label>
          <select id="direction" name="direction" className="h-11 w-full border border-espresso/15 px-3 text-sm" defaultValue="add">
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
        </div>
        <div>
          <Label htmlFor="reason">Reason</Label>
          <select id="reason" name="reason" className="h-11 w-full border border-espresso/15 px-3 text-sm" defaultValue="restock">
            {REASONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="note">Note</Label>
          <Input id="note" name="note" />
        </div>
        <Button type="submit">Save adjustment</Button>
      </ActionForm>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">History</h2>
        {movements?.length ? (
          <ul className="mt-4 divide-y divide-espresso/10 rounded-[1.25rem] border border-espresso/10 bg-white">
            {movements.map((movement) => (
              <li key={movement.id} className="px-4 py-3 text-sm">
                <p>
                  <span className={movement.change > 0 ? "text-leaf" : "text-red-800"}>
                    {movement.change > 0 ? `+${movement.change}` : movement.change}
                  </span>{" "}
                  · {String(movement.reason).replaceAll("_", " ")}
                </p>
                {movement.note ? <p className="text-taupe">{movement.note}</p> : null}
                <p className="text-xs text-taupe">
                  {new Intl.DateTimeFormat("en-GH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Africa/Accra",
                  }).format(new Date(movement.created_at))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-taupe">No movements yet.</p>
        )}
      </section>
    </div>
  );
}
