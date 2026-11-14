"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input readOnly value={value} className="h-11 min-w-0 flex-1 border border-espresso/15 px-3 text-sm" aria-label="Payment link" />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
