import { Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Skeleton className="h-10 w-64" />
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Skeleton className="aspect-[3/4]" />
        <Skeleton className="aspect-[3/4]" />
        <Skeleton className="aspect-[3/4]" />
      </div>
    </div>
  );
}
