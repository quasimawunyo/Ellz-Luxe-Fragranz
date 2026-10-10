import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-espresso text-ivory hover:bg-rich px-6 py-3 text-sm uppercase tracking-wide",
        gold:
          "bg-champagne text-espresso hover:bg-[#c4a45a] px-6 py-3 text-sm uppercase",
        outline:
          "border border-espresso/20 text-espresso hover:border-espresso px-6 py-3 text-sm uppercase bg-transparent",
        ghost: "text-espresso hover:text-champagne px-3 py-2 text-sm",
        danger: "bg-red-900 text-white hover:bg-red-800 px-6 py-3 text-sm",
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
