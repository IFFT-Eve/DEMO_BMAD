import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { db } from "@/server/db";
import { list, byId } from "@/server/services/productService";

const mockProduct = {
  id: "prod-1",
  slug: "classic-tee",
  name: "Classic Tee",
  description: "A timeless cotton tee.",
  imageUrl: "/products/classic-tee.jpg",
  priceCents: 1999,
  stock: 50,
  createdAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("productService.list", () => {
  it("returns all products ordered by name", async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([mockProduct]);

    const result = await list();

    expect(db.product.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    });
    expect(result).toEqual([mockProduct]);
  });

  it("returns an empty array when no products exist", async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([]);

    const result = await list();

    expect(result).toEqual([]);
  });
});

describe("productService.byId", () => {
  it("returns the product when it exists", async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue(mockProduct);

    const result = await byId("prod-1");

    expect(db.product.findUnique).toHaveBeenCalledWith({
      where: { id: "prod-1" },
    });
    expect(result).toEqual(mockProduct);
  });

  it("returns null when the product does not exist", async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue(null);

    const result = await byId("nonexistent-id");

    expect(result).toBeNull();
  });
});
