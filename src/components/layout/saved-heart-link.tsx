"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedLists } from "@/lib/saved/use-saved-lists";

const emptySubscribe = () => () => {};

export function SavedHeartLink({ className }: { className?: string }) {
  const { likes, waiting } = useSavedLists();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const count = mounted ? new Set([...likes, ...waiting]).size : 0;

  return (
    <Link href="/saved" className={className} aria-label={count ? `Saved, ${count}` : "Saved"}>
      <span className="relative inline-flex">
        <Heart className="size-[18px]" strokeWidth={1.75} />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-leaf text-[10px] font-medium text-white">
            {count}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
