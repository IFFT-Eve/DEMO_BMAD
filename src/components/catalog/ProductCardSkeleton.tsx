export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
