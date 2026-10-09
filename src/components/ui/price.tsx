import { formatMoney } from "@/lib/money";

export function Price({
  amountMinor,
  compareAtMinor,
  currencyCode = "GHS",
  className = "",
}: {
  amountMinor: number;
  compareAtMinor?: number | null;
  currencyCode?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span>{formatMoney(amountMinor, currencyCode)}</span>
      {compareAtMinor && compareAtMinor > amountMinor ? (
        <span className="text-taupe line-through">
          {formatMoney(compareAtMinor, currencyCode)}
        </span>
      ) : null}
    </span>
  );
}
