"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="mt-4 text-taupe">Please try again, or go back to the shop.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }))}>
          Shop
        </Link>
      </div>
    </div>
  );
}
