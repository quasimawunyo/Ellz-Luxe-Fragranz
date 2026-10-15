"use client";

import { Heart } from "lucide-react";
import { useSavedLists } from "@/lib/saved/use-saved-lists";
import { cn } from "@/lib/utils";

export function LikeButton({
  productId,
  name,
  className,
}: {
  productId: string;
  name: string;
  className?: string;
}) {
  const { isLiked, toggleLike } = useSavedLists();
  const liked = isLiked(productId);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
      onClick={() => toggleLike(productId)}
      className={cn(
        "grid size-11 place-items-center text-espresso hover:bg-espresso/5",
        className,
      )}
    >
      <Heart className="size-5" fill={liked ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}
