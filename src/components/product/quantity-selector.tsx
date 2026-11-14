"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuantitySelector({
  name = "quantity",
  defaultValue = 1,
  max = 6,
  disabled = false,
}: {
  name?: string;
  defaultValue?: number;
  max?: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const ceiling = Math.max(1, max);

  return (
    <div className={cn("inline-flex items-center border border-espresso/20", disabled && "opacity-50")}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Decrease quantity"
        disabled={disabled}
        onClick={() => setValue((current) => Math.max(1, current - 1))}
      >
        -
      </Button>
      <input
        name={name}
        type="number"
        min={1}
        max={ceiling}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (!Number.isFinite(next)) return;
          setValue(Math.min(ceiling, Math.max(1, next)));
        }}
        className="w-12 border-0 bg-transparent text-center text-sm"
        aria-label="Quantity"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => setValue((current) => Math.min(ceiling, current + 1))}
      >
        +
      </Button>
    </div>
  );
}
