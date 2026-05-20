"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CartDrawer } from "./CartDrawer";

type CartContextValue = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  pendingCount: number;
  addPending: (delta: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const addPending = useCallback(
    (delta: number) => setPendingCount((c) => c + delta),
    []
  );

  return (
    <CartContext.Provider value={{ isOpen, openCart, closeCart, pendingCount, addPending }}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
