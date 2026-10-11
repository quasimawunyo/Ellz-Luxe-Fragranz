import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 160,
  priority = false,
  href = "/",
  label = "EllzLuxe Fragranz home",
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  href?: string | false;
  label?: string;
}) {
  const image = (
    <Image
      src="/images/logo.png?v=header-ivory"
      alt={label}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className="h-auto w-full bg-transparent object-contain"
    />
  );
  const classes = cn("inline-flex shrink-0 bg-transparent", className);
  if (!href) {
    return <span className={classes}>{image}</span>;
  }
  return (
    <Link href={href} className={classes} aria-label={label}>
      {image}
    </Link>
  );
}
