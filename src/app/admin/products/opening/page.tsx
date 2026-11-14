import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { startTrackingAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { stockState } from "@/lib/stock";
import { StockBadge } from "@/components/admin/stock-badge";

export const metadata = { title: "Opening stock · Admin" };

export default async function OpeningStockPage() {
  await requireAdmin();
  const products = await getAllProductsForAdmin();
  const rows = products
    .flatMap((product) => product.variants.map((variant) => ({ product, variant, state: stockState(variant) })))
    .sort((a, b) => a.product.name.localeCompare(b.product.name) || (a.variant.sizeMl ?? 0) - (b.variant.sizeMl ?? 0));

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-taupe hover:text-espresso">
        Products
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Set opening stock</h1>
      <p className="mt-2 max-w-2xl text-sm text-taupe">
        Enter how many bottles you have, then start tracking. Until you do, that size stays for sale exactly as it is today. A quantity of zero marks it out of stock.
      </p>

      <ActionForm action={startTrackingAction} className="mt-8">
        <div className="overflow-x-auto rounded-[1.25rem] border border-espresso/10 bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/10 text-xs text-taupe">
                <th className="px-4 py-3">Bottle</th>
                <th>Size</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.variant.id} className="border-b border-espresso/10 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.product.name}</p>
                    <p className="text-taupe">{row.product.brand}</p>
                  </td>
                  <td>{row.variant.label}</td>
                  <td>{formatMoney(row.variant.priceMinor)}</td>
                  <td>
                    {row.variant.trackStock ? (
                      row.variant.stockQuantity
                    ) : (
                      <>
                        <input type="hidden" name="variantId" value={row.variant.id} />
                        <label className="sr-only" htmlFor={`qty-${row.variant.id}`}>
                          Opening quantity for {row.product.name} {row.variant.label}
                        </label>
                        <input
                          id={`qty-${row.variant.id}`}
                          name={`quantity-${row.variant.id}`}
                          type="number"
                          min={0}
                          step={1}
                          defaultValue={row.variant.stockQuantity}
                          className="h-11 w-24 border border-espresso/15 px-2"
                        />
                      </>
                    )}
                  </td>
                  <td>
                    <StockBadge state={row.state} />
                  </td>
                  <td className="pr-4 text-right">
                    {row.variant.trackStock ? (
                      <Link href={`/admin/products/stock/${row.variant.id}`} className="text-leaf underline underline-offset-4">
                        Adjust stock
                      </Link>
                    ) : (
                      <Button type="submit" name="only" value={row.variant.id} variant="outline">
                        Start tracking
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="submit" className="mt-4">
          Start tracking for all
        </Button>
      </ActionForm>
    </div>
  );
}
