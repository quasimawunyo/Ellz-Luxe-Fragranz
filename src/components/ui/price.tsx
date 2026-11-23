import { formatMoney } from "@/lib/money";

export function Price({
  amountMinor,
  compareAtMinor,
  currencyCode = "GHS",
  className = "",
  showSave = false,
}: {
  amountMinor: number;
  compareAtMinor?: number | null;
  currencyCode?: string;
  className?: string;
  showSave?: boolean;
}) {
  const onSale = compareAtMinor != null && compareAtMinor > amountMinor;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span>
        {onSale ? <span className="sr-only">now </span> : null}
        {formatMoney(amountMinor, currencyCode)}
      </span>
      {onSale ? (
        <span className="text-taupe line-through">
          <span className="sr-only">was </span>
          {formatMoney(compareAtMinor, currencyCode)}
        </span>
      ) : null}
      {showSave && onSale ? <span className="text-sm font-medium text-espresso">Save {formatMoney(compareAtMinor - amountMinor, currencyCode)}</span> : null}
    </span>
  );
}
