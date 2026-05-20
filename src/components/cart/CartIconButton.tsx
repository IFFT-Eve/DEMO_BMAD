"use client";

import { ShoppingCartIcon } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useCart } from "./CartProvider";

export function CartIconButton() {
  const { openCart, pendingCount } = useCart();
  const { data: cart } = trpc.cart.get.useQuery();

  const totalCount = (cart?.itemCount ?? 0) + pendingCount;
  const label =
    totalCount > 0
      ? `Open cart, ${totalCount} item${totalCount !== 1 ? "s" : ""}`
      : "Open cart";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={openCart}
      className="relative rounded-sm p-1 text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ShoppingCartIcon className="size-[22px]" aria-hidden="true" />
      {totalCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium tabular-nums leading-none"
        >
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </button>
  );
}
