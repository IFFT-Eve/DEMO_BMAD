"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CatalogError({ error, reset }: Props) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-24 flex flex-col items-center gap-4 text-center">
      <p className="text-lg font-medium text-foreground">
        Something went wrong loading the catalog.
      </p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </main>
  );
}
