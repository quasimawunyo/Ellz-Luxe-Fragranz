import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm text-espresso placeholder:text-taupe focus:border-leaf focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cn("mb-1 block text-sm font-medium text-espresso", className)} {...props} />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full border border-espresso/15 bg-white px-3 py-3 text-sm text-espresso placeholder:text-taupe focus:border-espresso focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-red-800">{children}</p>;
}
