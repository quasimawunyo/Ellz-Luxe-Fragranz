"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Price } from "@/components/ui/price";

export const SALE_POPUP_INTERVAL_MS = 90_000;

export type SalePopupOffer = {
  id: string;
  label: string;
  priceMinor: number;
  compareAtMinor: number;
};

export type SalePopupProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  imageAlt: string;
  offers: SalePopupOffer[];
};

export function SalePopup({ products }: { products: SalePopupProduct[] }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shown = products.slice(0, 4);

  useEffect(() => {
    if (products.length === 0 || open) return;
    const id = window.setTimeout(() => setOpen(true), SALE_POPUP_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [open, products.length]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open || shown.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-rich/50 p-4 pb-24 sm:items-center sm:p-6"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-popup-title"
        className="max-h-[min(34rem,calc(100dvh-8rem))] w-full max-w-md overflow-y-auto rounded-[1.5rem] bg-ivory p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="sale-popup-title" className="font-serif text-3xl leading-tight">
              Flash sales
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close flash sales"
            className="grid size-10 shrink-0 place-items-center rounded-full text-espresso hover:bg-espresso/5"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-taupe">Bottles at Ells Luxe Annex.</p>
        <ul className="mt-5 space-y-3">
          {shown.map((product) => (
            <li key={product.id}>
              <Link
                href={`/product/${product.slug}`}
                onClick={() => setOpen(false)}
                className="flex gap-3 rounded-2xl bg-white p-3"
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt}
                    width={72}
                    height={72}
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="size-16 shrink-0 rounded-xl bg-espresso/5" />
                )}
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-taupe">{product.brand}</span>
                  <span className="mt-1 block font-serif text-lg leading-snug">{product.name}</span>
                  <span className="mt-1 block space-y-0.5">
                    {product.offers.map((offer) => (
                      <span key={offer.id} className="flex flex-wrap items-baseline gap-2">
                        {product.offers.length > 1 ? (
                          <span className="text-[11px] uppercase tracking-[0.14em] text-taupe">{offer.label}</span>
                        ) : null}
                        <Price
                          amountMinor={offer.priceMinor}
                          compareAtMinor={offer.compareAtMinor}
                          className="text-sm font-semibold text-leaf"
                        />
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/sale"
          onClick={() => setOpen(false)}
          className="mt-5 block text-center text-sm text-leaf hover:text-espresso"
        >
          View flash sales
        </Link>
      </div>
    </div>
  );
}
