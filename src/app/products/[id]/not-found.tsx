import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-24 flex flex-col items-center gap-4 text-center">
      <p className="text-lg font-medium text-foreground">Product not found</p>
      <p className="text-sm text-muted-foreground">
        This product doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        Browse the catalog
      </Link>
    </main>
  );
}
