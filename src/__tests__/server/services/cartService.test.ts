import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from "@/server/db";
import * as cartService from "@/server/services/cartService";

const mockProduct = {
  id: "prod-1",
  name: "Classic Tee",
  priceCents: 1999,
  imageUrl: "/classic-tee.jpg",
};

const mockCart = {
  id: "cart-1",
  userId: null,
  guestToken: "token-abc",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── cartService.get ────────────────────────────────────────────────────────

describe("cartService.get", () => {
  it("returns null when no user and no guest token", async () => {
    const result = await cartService.get(null, null);
    expect(result).toBeNull();
    expect(db.cart.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when cart does not exist for guest token", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(null);
    const result = await cartService.get(null, "ghost-token");
    expect(result).toBeNull();
  });

  it("returns cart with computed totals for guest with one item", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findMany).mockResolvedValue([
      {
        id: "item-1",
        cartId: "cart-1",
        productId: "prod-1",
        quantity: 2,
        product: mockProduct,
      },
    ] as never);

    const result = await cartService.get(null, "token-abc");

    expect(result).not.toBeNull();
    expect(result!.itemCount).toBe(2);
    expect(result!.totalCents).toBe(3998);
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0]!.product.name).toBe("Classic Tee");
  });

  it("returns empty cart totals when cart has no items", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findMany).mockResolvedValue([]);

    const result = await cartService.get(null, "token-abc");

    expect(result!.itemCount).toBe(0);
    expect(result!.totalCents).toBe(0);
    expect(result!.items).toHaveLength(0);
  });

  it("sums quantities and prices correctly for multiple items", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findMany).mockResolvedValue([
      { id: "item-1", cartId: "cart-1", productId: "prod-1", quantity: 2, product: { ...mockProduct, priceCents: 1000 } },
      { id: "item-2", cartId: "cart-1", productId: "prod-2", quantity: 3, product: { ...mockProduct, id: "prod-2", priceCents: 500 } },
    ] as never);

    const result = await cartService.get(null, "token-abc");

    expect(result!.itemCount).toBe(5); // 2 + 3
    expect(result!.totalCents).toBe(3500); // 2*1000 + 3*500
  });
});

// ─── cartService.addItem ────────────────────────────────────────────────────

describe("cartService.addItem", () => {
  it("creates a new cart + sets guest cookie when guest has no existing cart", async () => {
    const resHeaders = new Headers();
    const appendSpy = vi.spyOn(resHeaders, "append");

    vi.mocked(db.cart.findUnique).mockResolvedValue(null);
    vi.mocked(db.cart.create).mockResolvedValue({ ...mockCart, guestToken: "new-token" });
    vi.mocked(db.cartItem.findUnique).mockResolvedValue(null);
    vi.mocked(db.cartItem.create).mockResolvedValue({} as never);

    await cartService.addItem("prod-1", null, null, resHeaders);

    expect(db.cart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ guestToken: expect.any(String) }),
      })
    );
    expect(appendSpy).toHaveBeenCalledWith(
      "Set-Cookie",
      expect.stringContaining("guest_cart_token=")
    );
  });

  it("reuses existing guest cart without setting a new cookie", async () => {
    const resHeaders = new Headers();
    const appendSpy = vi.spyOn(resHeaders, "append");

    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findUnique).mockResolvedValue(null);
    vi.mocked(db.cartItem.create).mockResolvedValue({} as never);

    await cartService.addItem("prod-1", null, "token-abc", resHeaders);

    expect(db.cart.create).not.toHaveBeenCalled();
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it("increments quantity when product already exists in cart", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findUnique).mockResolvedValue({
      id: "item-1",
      cartId: "cart-1",
      productId: "prod-1",
      quantity: 2,
    } as never);
    vi.mocked(db.cartItem.update).mockResolvedValue({} as never);

    await cartService.addItem("prod-1", null, "token-abc", new Headers());

    expect(db.cartItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { quantity: 3 },
    });
    expect(db.cartItem.create).not.toHaveBeenCalled();
  });

  it("creates a new cart item when product not yet in cart", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findUnique).mockResolvedValue(null);
    vi.mocked(db.cartItem.create).mockResolvedValue({} as never);

    await cartService.addItem("prod-1", null, "token-abc", new Headers());

    expect(db.cartItem.create).toHaveBeenCalledWith({
      data: { cartId: "cart-1", productId: "prod-1", quantity: 1 },
    });
  });

  it("upserts user cart and does not set a cookie for authenticated user", async () => {
    const resHeaders = new Headers();
    const appendSpy = vi.spyOn(resHeaders, "append");

    vi.mocked(db.cart.upsert).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findUnique).mockResolvedValue(null);
    vi.mocked(db.cartItem.create).mockResolvedValue({} as never);

    await cartService.addItem("prod-1", "user-1", null, resHeaders);

    expect(db.cart.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: { userId: "user-1" },
      update: {},
    });
    expect(appendSpy).not.toHaveBeenCalled();
  });
});

// ─── cartService.updateItem ─────────────────────────────────────────────────

describe("cartService.updateItem", () => {
  it("throws when no cart exists for the caller", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(null);
    await expect(cartService.updateItem("item-1", 2, null, null)).rejects.toThrow("Cart not found");
  });

  it("throws when item does not belong to caller's cart", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findFirst).mockResolvedValue(null);
    await expect(cartService.updateItem("item-x", 2, null, "token-abc")).rejects.toThrow("Item not found");
  });

  it("updates quantity to a valid positive value", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findFirst).mockResolvedValue({
      id: "item-1", cartId: "cart-1", productId: "prod-1", quantity: 1,
    } as never);
    vi.mocked(db.cartItem.update).mockResolvedValue({} as never);

    await cartService.updateItem("item-1", 4, null, "token-abc");

    expect(db.cartItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { quantity: 4 },
    });
    expect(db.cartItem.delete).not.toHaveBeenCalled();
  });

  it("deletes the item when quantity is set to 0 (edge case)", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findFirst).mockResolvedValue({
      id: "item-1", cartId: "cart-1", productId: "prod-1", quantity: 2,
    } as never);
    vi.mocked(db.cartItem.delete).mockResolvedValue({} as never);

    await cartService.updateItem("item-1", 0, null, "token-abc");

    expect(db.cartItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
    expect(db.cartItem.update).not.toHaveBeenCalled();
  });

  it("deletes the item when quantity is negative (abnormal — treated as remove)", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findFirst).mockResolvedValue({
      id: "item-1", cartId: "cart-1", productId: "prod-1", quantity: 1,
    } as never);
    vi.mocked(db.cartItem.delete).mockResolvedValue({} as never);

    await cartService.updateItem("item-1", -1, null, "token-abc");

    expect(db.cartItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });
});

// ─── cartService.removeItem ─────────────────────────────────────────────────

describe("cartService.removeItem", () => {
  it("throws when no cart exists for the caller", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(null);
    await expect(cartService.removeItem("item-1", null, null)).rejects.toThrow("Cart not found");
  });

  it("throws when item does not belong to caller's cart", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findFirst).mockResolvedValue(null);
    await expect(cartService.removeItem("item-x", null, "token-abc")).rejects.toThrow("Item not found");
  });

  it("deletes the cart item", async () => {
    vi.mocked(db.cart.findUnique).mockResolvedValue(mockCart);
    vi.mocked(db.cartItem.findFirst).mockResolvedValue({
      id: "item-1", cartId: "cart-1", productId: "prod-1", quantity: 1,
    } as never);
    vi.mocked(db.cartItem.delete).mockResolvedValue({} as never);

    await cartService.removeItem("item-1", null, "token-abc");

    expect(db.cartItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });
});
