"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(images[0]);
  if (!active) {
    return <div className="aspect-square rounded-[1.5rem] bg-espresso/5" />;
  }

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[1.5rem] bg-espresso/5 lg:max-w-none">
        <Image
          src={active.url}
          alt={active.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(image)}
              className={`relative size-16 overflow-hidden border ${
                active.id === image.id ? "border-espresso" : "border-transparent"
              }`}
              aria-label={`Show image ${image.position + 1}`}
            >
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
