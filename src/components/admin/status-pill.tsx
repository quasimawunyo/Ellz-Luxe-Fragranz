import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-espresso text-ivory",
  pending: "bg-champagne/25 text-espresso",
  failed: "bg-red-900/10 text-red-900",
  refunded: "bg-taupe/20 text-taupe",
  unfulfilled: "bg-champagne/20 text-espresso",
  processing: "bg-espresso/10 text-espresso",
  shipped: "bg-espresso/15 text-espresso",
  delivered: "bg-espresso text-ivory",
  cancelled: "bg-taupe/15 text-taupe",
  published: "bg-espresso text-ivory",
  draft: "bg-champagne/25 text-espresso",
  archived: "bg-taupe/20 text-taupe",
  live: "bg-espresso text-ivory",
  demonstration: "bg-ivory text-taupe border border-espresso/15",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
        TONES[value] ?? "bg-ivory text-taupe border border-espresso/10",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
