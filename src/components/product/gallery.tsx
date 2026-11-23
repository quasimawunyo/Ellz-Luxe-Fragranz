"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const frames = images.filter((image, index, all) => all.findIndex((item) => item.url === image.url) === index);
  const [active, setActive] = useState(frames[0]);
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
          sizes="(min-width: 1920px) 50vw, (min-width: 1024px) 36rem, (min-width: 768px) 28rem, 100vw"
          className="object-cover"
        />
      </div>
      {frames.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {frames.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(image)}
              className={`relative size-16 overflow-hidden border ${
                active.id === image.id ? "border-espresso" : "border-transparent"
              }`}
              aria-label={`Show image ${image.position + 1}`}
            >
              <Image src={image.url} alt="" aria-hidden fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
