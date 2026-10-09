export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-espresso/20 px-8 py-16 text-center">
      <h2 className="font-serif text-3xl">{title}</h2>
      {children ? <div className="mt-3 text-taupe">{children}</div> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-red-900/30 bg-red-50 px-6 py-8 text-red-950">
      {message}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-espresso/10 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}
