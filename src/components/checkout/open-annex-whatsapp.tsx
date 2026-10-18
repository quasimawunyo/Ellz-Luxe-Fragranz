"use client";

import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OpenAnnexWhatsApp({
  href,
  phone,
  orderNumber,
  auto = true,
}: {
  href: string;
  phone: string;
  orderNumber: string;
  auto?: boolean;
}) {
  useEffect(() => {
    if (!auto) return;
    const key = `elf-annex-wa-${orderNumber}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    window.location.assign(href);
  }, [auto, href, orderNumber]);

  return (
    <p className="mt-8">
      <a href={href} className={cn(buttonVariants({ variant: "shop" }), "inline-flex px-8")}>
        Send this order on WhatsApp
      </a>
      <span className="mt-3 block text-sm text-taupe">
        Opening WhatsApp to {phone} with this order. If it does not open, tap the button.
      </span>
    </p>
  );
}
