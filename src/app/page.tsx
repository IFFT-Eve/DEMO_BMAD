import { appRouter } from "@/server/root";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export default async function CatalogPage() {
  const caller = appRouter.createCaller({ user: null, guestToken: null, resHeaders: new Headers() });
  const products = await caller.product.list();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-[var(--font-heading)] font-semibold text-foreground">
        All Products
      </h1>
      <ProductGrid products={products} />
    </main>
  );
}
