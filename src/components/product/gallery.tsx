"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(images[0]);
  if (!active) {
    return <div className="aspect-[3/4] bg-ivory" />;
  }

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
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
        <div className="mt-4 flex gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(image)}
              className={`relative h-16 w-12 overflow-hidden border ${
                active.id === image.id ? "border-espresso" : "border-espresso/15"
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
