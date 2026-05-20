"use client";

import Link from "next/link";
import { toast } from "sonner";
import { ShoppingCartIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc/client";
import { formatCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { CartItemRow } from "./CartItemRow";

export function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  const utils = trpc.useUtils();

  const { data: cart, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isOpen,
  });

  const updateItem = trpc.cart.updateItem.useMutation({
    onMutate: async ({ id, quantity }) => {
      await utils.cart.get.cancel();
      const prev = utils.cart.get.getData();

      utils.cart.get.setData(undefined, (old) => {
        if (!old) return old;
        const updatedItems =
          quantity <= 0
            ? old.items.filter((i) => i.id !== id)
            : old.items.map((i) => (i.id === id ? { ...i, quantity } : i));
        const itemCount = updatedItems.reduce((s, i) => s + i.quantity, 0);
        const totalCents = updatedItems.reduce(
          (s, i) => s + i.quantity * i.product.priceCents,
          0
        );
        return { ...old, items: updatedItems, itemCount, totalCents };
      });

      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev !== undefined) utils.cart.get.setData(undefined, ctx.prev);
      toast.error("Failed to update quantity");
    },
    onSettled: () => {
      utils.cart.get.invalidate();
    },
  });

  const removeItem = trpc.cart.removeItem.useMutation({
    onMutate: async ({ id }) => {
      await utils.cart.get.cancel();
      const prev = utils.cart.get.getData();

      utils.cart.get.setData(undefined, (old) => {
        if (!old) return old;
        const updatedItems = old.items.filter((i) => i.id !== id);
        const itemCount = updatedItems.reduce((s, i) => s + i.quantity, 0);
        const totalCents = updatedItems.reduce(
          (s, i) => s + i.quantity * i.product.priceCents,
          0
        );
        return { ...old, items: updatedItems, itemCount, totalCents };
      });

      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev !== undefined) utils.cart.get.setData(undefined, ctx.prev);
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      utils.cart.get.invalidate();
    },
  });

  const isEmpty = !cart || cart.items.length === 0;
  const isMutating = updateItem.isPending || removeItem.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col p-0" showCloseButton>
        <SheetHeader className="border-b px-4 pt-4 pb-3 pr-12">
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Loading…
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingCartIcon
                className="size-12 text-muted-foreground/40"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add some products to get started.
                </p>
              </div>
              <Link
                href="/"
                onClick={closeCart}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul
              className="divide-y divide-border"
              aria-label="Cart items"
              aria-live="polite"
            >
              {cart.items.map((item) => (
                <li key={item.id}>
                  <CartItemRow
                    item={item}
                    isPending={isMutating}
                    onUpdateQuantity={(id, qty) =>
                      updateItem.mutate({ id, quantity: qty })
                    }
                    onRemove={(id) => removeItem.mutate({ id })}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isEmpty && cart && (
          <SheetFooter className="border-t px-4 py-4 flex-col gap-3">
            <div className="flex items-center justify-between w-full text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground tabular-nums">
                {formatCents(cart.totalCents)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className={cn(buttonVariants(), "w-full justify-center")}
            >
              Checkout
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
