"use client";

import { useState } from "react";

export const QUICK_SIZES = [30, 50, 75, 80, 100, 125, 150, 200];

export type SizeRow = {
  id: string;
  sizeMl: string;
  priceCedis: string;
  compareAtCedis: string;
  sku: string;
  visible: boolean;
  ordered: boolean;
  stockQuantity: string;
  trackStock: boolean;
  costCedis: string;
  lowStockThreshold: string;
};

export function emptySizeRow(): SizeRow {
  return {
    id: "",
    sizeMl: "",
    priceCedis: "",
    compareAtCedis: "",
    sku: "",
    visible: true,
    ordered: false,
    stockQuantity: "0",
    trackStock: false,
    costCedis: "",
    lowStockThreshold: "",
  };
}

export function SizeRows({ initial }: { initial: SizeRow[] }) {
  const [rows, setRows] = useState(initial.length ? initial : [emptySizeRow()]);

  function update(index: number, patch: Partial<SizeRow>) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-4">
      <h2 className="pt-4 font-serif text-2xl">Sizes</h2>
      <input type="hidden" name="sizesJson" value={JSON.stringify(rows)} />
      {rows.map((row, index) => (
        <fieldset key={`${row.id || "new"}-${index}`} className="space-y-3 border border-espresso/15 p-4">
          <legend className="px-1 text-sm">Size {index + 1}</legend>
          <div>
            <label className="text-sm" htmlFor={`size-${index}`}>
              Size in ml
            </label>
            <input
              id={`size-${index}`}
              inputMode="numeric"
              className="mt-1 min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
              value={row.sizeMl}
              onChange={(event) => update(index, { sizeMl: event.target.value })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="min-h-11 border border-espresso/15 px-3 text-sm"
                  onClick={() => update(index, { sizeMl: String(size) })}
                >
                  {size} ml
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm" htmlFor={`price-${index}`}>
              Price (GH₵)
            </label>
            <input
              id={`price-${index}`}
              inputMode="decimal"
              className="mt-1 min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
              value={row.priceCedis}
              onChange={(event) => update(index, { priceCedis: event.target.value })}
            />
          </div>
          <div>
            <label className="text-sm" htmlFor={`compare-${index}`}>
              Compare-at price (GH₵)
            </label>
            <input
              id={`compare-${index}`}
              inputMode="decimal"
              className="mt-1 min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
              value={row.compareAtCedis}
              onChange={(event) => update(index, { compareAtCedis: event.target.value })}
            />
          </div>
          <div>
            <label className="text-sm" htmlFor={`sku-${index}`}>
              SKU
            </label>
            <input
              id={`sku-${index}`}
              className="mt-1 min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
              value={row.sku}
              onChange={(event) => update(index, { sku: event.target.value })}
            />
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="size-5" checked={row.visible} onChange={(event) => update(index, { visible: event.target.checked })} />
            Show on shop
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="size-5" checked={row.trackStock} onChange={(event) => update(index, { trackStock: event.target.checked })} />
            Track stock
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm" htmlFor={`qty-${index}`}>Quantity</label>
              <input id={`qty-${index}`} inputMode="numeric" className="mt-1 min-h-11 w-full border border-espresso/15 px-3 text-sm" value={row.stockQuantity} onChange={(event) => update(index, { stockQuantity: event.target.value })} />
            </div>
            <div>
              <label className="text-sm" htmlFor={`cost-${index}`}>Cost (GH₵)</label>
              <input id={`cost-${index}`} inputMode="decimal" className="mt-1 min-h-11 w-full border border-espresso/15 px-3 text-sm" value={row.costCedis} onChange={(event) => update(index, { costCedis: event.target.value })} />
            </div>
            <div>
              <label className="text-sm" htmlFor={`low-${index}`}>Low-stock threshold</label>
              <input id={`low-${index}`} inputMode="numeric" className="mt-1 min-h-11 w-full border border-espresso/15 px-3 text-sm" value={row.lowStockThreshold} onChange={(event) => update(index, { lowStockThreshold: event.target.value })} />
            </div>
          </div>
          {row.ordered ? (
            <p className="text-sm text-taupe">This size has been ordered. Hide it instead of removing it.</p>
          ) : (
            <button
              type="button"
              className="min-h-11 text-sm underline"
              onClick={() => setRows((current) => (current.length === 1 ? current : current.filter((_, rowIndex) => rowIndex !== index)))}
            >
              Remove this size
            </button>
          )}
        </fieldset>
      ))}
      <button type="button" className="min-h-11 border border-espresso/15 px-4 text-sm" onClick={() => setRows((current) => [...current, emptySizeRow()])}>
        Add another size
      </button>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" name="confirmLowPrice" value="yes" className="size-5" />
        Save a price under GH₵50
      </label>
    </div>
  );
}
