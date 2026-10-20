import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-75 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-espresso text-ivory hover:bg-rich px-5 py-2.5",
        gold: "rounded-full bg-champagne px-8 py-2.5 text-espresso hover:bg-champagne/90",
        solid: "rounded-full bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.28em] text-espresso hover:bg-ivory",
        outline: "border border-espresso/20 text-espresso hover:border-espresso px-5 py-2.5 bg-transparent",
        ghost: "text-espresso hover:text-champagne px-3 py-2",
        ghostOnDark:
          "bg-transparent px-4 py-3.5 text-[11px] font-medium uppercase tracking-[0.28em] text-snow/90 hover:text-snow",
        danger: "bg-red-900 text-ivory hover:bg-red-800 px-5 py-2.5",
        shop: "rounded-full bg-leaf px-5 py-2.5 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset] hover:bg-leaf/90",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 px-3 text-sm",
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
