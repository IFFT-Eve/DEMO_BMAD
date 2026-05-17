export default function ProductDetailLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="h-4 w-28 rounded bg-muted animate-pulse mb-6" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-muted animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-6 w-1/4 rounded bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </main>
  );
}
