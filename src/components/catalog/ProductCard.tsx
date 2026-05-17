import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/money";

interface Product {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
}

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="font-medium text-foreground line-clamp-1">
          {product.name}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatCents(product.priceCents)}
        </span>
        {product.stock === 0 && (
          <span className="text-xs text-destructive">Out of stock</span>
        )}
      </div>
    </Link>
  );
}
