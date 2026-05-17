import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { appRouter } from "@/server/root";
import { formatCents } from "@/lib/money";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const caller = appRouter.createCaller({ user: null, guestToken: null });
  const product = await caller.product.byId({ id });

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        ← Back to catalog
      </Link>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-[var(--font-heading)] font-semibold text-foreground leading-tight">
            {product.name}
          </h1>
          <p className="text-2xl font-medium text-foreground">
            {formatCents(product.priceCents)}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          {product.stock > 0 ? (
            <p className="text-sm text-green-700 font-medium">
              In stock ({product.stock} available)
            </p>
          ) : (
            <p className="text-sm text-destructive font-medium">Out of stock</p>
          )}
        </div>
      </div>
    </main>
  );
}
