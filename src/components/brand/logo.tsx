import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 72,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0", className)} aria-label="Ellz Luxe Fragranz home">
      <Image
        src="/images/logo.png"
        alt="Ellz Luxe Fragranz"
        width={size}
        height={size}
        priority={priority}
        className="h-auto w-full object-contain"
      />
    </Link>
  );
}
