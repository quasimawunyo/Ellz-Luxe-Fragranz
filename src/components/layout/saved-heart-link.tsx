"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedLists } from "@/lib/saved/use-saved-lists";

export function SavedHeartLink({ className }: { className?: string }) {
  const { likes, waiting } = useSavedLists();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? new Set([...likes, ...waiting]).size : 0;

  return (
    <Link href="/saved" className={className} aria-label="Saved">
      <span className="relative inline-flex">
        <Heart className="size-5" />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-leaf text-[10px] font-medium text-white">
            {count}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
