import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-espresso text-ivory hover:bg-rich px-7 py-3 text-[11px] uppercase tracking-[0.22em]",
        gold:
          "border border-champagne bg-champagne/90 text-espresso hover:bg-champagne px-7 py-3 text-[11px] uppercase tracking-[0.22em]",
        outline:
          "border border-espresso/25 text-espresso hover:border-champagne hover:text-champagne px-7 py-3 text-[11px] uppercase tracking-[0.22em] bg-transparent",
        ghost: "text-espresso hover:text-champagne px-3 py-2 text-sm tracking-[0.04em]",
        danger: "bg-red-950 text-ivory hover:bg-red-900 px-7 py-3 text-[11px] uppercase tracking-[0.18em]",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 px-4 text-xs",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
