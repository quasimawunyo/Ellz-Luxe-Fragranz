import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-4 text-taupe">This page is not available.</p>
      <Link href="/shop" className={cn(buttonVariants({ variant: "shop" }), "mt-8 inline-flex")}>
        Back to shop
      </Link>
    </div>
  );
}
