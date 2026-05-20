"use client";

import { toast } from "sonner";
import { ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { useCart } from "./CartProvider";

interface Props {
  productId: string;
  inStock: boolean;
}

export function AddToCartButton({ productId, inStock }: Props) {
  const { addPending } = useCart();
  const utils = trpc.useUtils();

  const { mutate, isPending } = trpc.cart.addItem.useMutation({
    onMutate: () => {
      addPending(1);
    },
    onSuccess: () => {
      toast.success("Added to cart");
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
    onSettled: async () => {
      // Await the refetch so serverCount is updated before removing the optimistic +1.
      await utils.cart.get.invalidate();
      addPending(-1);
    },
  });

  if (!inStock) {
    return (
      <Button className="w-full" disabled aria-label="Out of stock">
        <ShoppingCartIcon />
        Out of stock
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() => mutate({ productId })}
      aria-label="Add to cart"
    >
      <ShoppingCartIcon />
      {isPending ? "Adding…" : "Add to cart"}
    </Button>
  );
}
