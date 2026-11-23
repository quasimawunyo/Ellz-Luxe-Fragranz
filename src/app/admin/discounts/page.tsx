import { setSalePricesAction } from "@/app/actions/admin";
import { ActionForm, FieldError } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { shopVariants } from "@/lib/catalog/helpers";
import { cedisInputFromMinor, formatMoney } from "@/lib/money";

export const metadata = { title: "Discounts · Shop desk" };

export default async function DiscountsPage() {
  const products = await getAllProductsForAdmin();
  const rows = products.flatMap((product) =>
    shopVariants(product).map((variant) => ({
      id: variant.id,
      name: product.name,
      size: variant.sizeMl == null ? variant.label : `${variant.sizeMl} ml`,
      priceMinor: variant.priceMinor,
      compareAtMinor: variant.compareAtMinor,
    })),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-4xl">Discounts</h1>
      <p className="mt-3 text-sm text-taupe">Set a compare-at price that is higher than the selling price. Clear a row to take that size off sale.</p>
      <ActionForm action={setSalePricesAction} className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/15 text-taupe">
                <th className="py-2">Bottle</th>
                <th>Price</th>
                <th>Compare-at</th>
                <th>Off</th>
                <th>Clear</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const off =
                  row.compareAtMinor && row.compareAtMinor > row.priceMinor
                    ? Math.round(((row.compareAtMinor - row.priceMinor) / row.compareAtMinor) * 100)
                    : null;
                return (
                  <tr key={row.id} className="border-b border-espresso/10">
                    <td className="py-3">
                      {row.name}, {row.size}
                      <input type="hidden" name="variantId" value={row.id} />
                    </td>
                    <td>{formatMoney(row.priceMinor)}</td>
                    <td>
                      <input
                        name={`compare:${row.id}`}
                        defaultValue={row.compareAtMinor != null ? cedisInputFromMinor(row.compareAtMinor) : ""}
                        inputMode="decimal"
                        aria-label={`Compare-at price for ${row.name}, ${row.size}`}
                        className="min-h-11 w-28 border border-espresso/15 px-2"
                      />
                    </td>
                    <td>{off == null ? "—" : `${off}%`}</td>
                    <td>
                      <input type="checkbox" name={`clear:${row.id}`} aria-label={`Clear sale for ${row.name}, ${row.size}`} className="size-5" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <FieldError name="form" />
        <Button type="submit" variant="shop" className="mt-6">
          Save sale prices
        </Button>
      </ActionForm>
    </div>
  );
}
