import { cn } from "@/lib/utils";
import { STOCK_BADGE_LABEL, type StockState } from "@/lib/stock";

const TONES: Record<StockState, string> = {
  in_stock: "bg-leaf text-white",
  low_stock: "bg-amber-100 text-espresso",
  out_of_stock: "bg-red-100 text-red-900",
  not_tracked: "bg-espresso/5 text-taupe",
};

export function StockBadge({ state }: { state: StockState }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs", TONES[state])}>
      {STOCK_BADGE_LABEL[state]}
    </span>
  );
}
