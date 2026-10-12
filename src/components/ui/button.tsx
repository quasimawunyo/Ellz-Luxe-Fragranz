import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-espresso text-ivory hover:bg-rich px-5 py-2.5",
        gold: "bg-champagne text-espresso hover:bg-champagne/90 px-5 py-2.5",
        outline: "border border-espresso/20 text-espresso hover:border-espresso px-5 py-2.5 bg-transparent",
        ghost: "text-espresso hover:text-champagne px-3 py-2",
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
