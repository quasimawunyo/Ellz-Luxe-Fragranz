import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-espresso text-ivory",
  pending: "bg-amber-100 text-espresso",
  failed: "bg-red-100 text-red-900",
  refunded: "bg-taupe/20 text-taupe",
  unfulfilled: "bg-amber-100 text-espresso",
  processing: "bg-espresso/10 text-espresso",
  shipped: "bg-espresso/15 text-espresso",
  delivered: "bg-espresso text-ivory",
  cancelled: "bg-taupe/15 text-taupe",
  published: "bg-espresso text-ivory",
  draft: "bg-amber-100 text-espresso",
  archived: "bg-taupe/20 text-taupe",
  live: "bg-espresso text-ivory",
  demonstration: "border border-espresso/15 text-taupe",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs capitalize",
        TONES[value] ?? "border border-espresso/10 text-taupe",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
