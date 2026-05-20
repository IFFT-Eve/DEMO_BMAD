"use client";

import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/money";
import type { CartItemWithProduct } from "@/server/services/cartService";

interface Props {
  item: CartItemWithProduct;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isPending: boolean;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, isPending }: Props) {
  return (
    <div className="flex gap-3 py-3" aria-label={`${item.product.name} in cart`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground leading-tight truncate">
          {item.product.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCents(item.product.priceCents)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-sm font-medium text-foreground tabular-nums">
          {formatCents(item.product.priceCents * item.quantity)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={`Decrease quantity of ${item.product.name}`}
            disabled={isPending}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            <MinusIcon />
          </Button>
          <span
            className="w-6 text-center text-sm tabular-nums"
            aria-label={`Quantity: ${item.quantity}`}
            aria-live="polite"
          >
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={`Increase quantity of ${item.product.name}`}
            disabled={isPending}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <PlusIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Remove ${item.product.name} from cart`}
            disabled={isPending}
            onClick={() => onRemove(item.id)}
          >
            <XIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
