import { db } from "../db";

export type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    imageUrl: string;
  };
};

export type CartData = {
  id: string;
  itemCount: number;
  totalCents: number;
  items: CartItemWithProduct[];
};

function computeTotals(items: CartItemWithProduct[]): {
  itemCount: number;
  totalCents: number;
} {
  return items.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + item.quantity,
      totalCents: acc.totalCents + item.quantity * item.product.priceCents,
    }),
    { itemCount: 0, totalCents: 0 }
  );
}

function setGuestCookie(resHeaders: Headers, token: string) {
  resHeaders.append(
    "Set-Cookie",
    `guest_cart_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`
  );
}

async function findCart(userId: string | null, guestToken: string | null) {
  if (userId) {
    return db.cart.findUnique({ where: { userId } });
  }
  if (guestToken) {
    return db.cart.findUnique({ where: { guestToken } });
  }
  return null;
}

export async function get(
  userId: string | null,
  guestToken: string | null
): Promise<CartData | null> {
  const cart = await findCart(userId, guestToken);
  if (!cart) return null;

  const rawItems = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  const items: CartItemWithProduct[] = rawItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      priceCents: item.product.priceCents,
      imageUrl: item.product.imageUrl,
    },
  }));

  return { id: cart.id, ...computeTotals(items), items };
}

export async function addItem(
  productId: string,
  userId: string | null,
  guestToken: string | null,
  resHeaders: Headers
): Promise<void> {
  let cartId: string;

  if (userId) {
    const cart = await db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    cartId = cart.id;
  } else {
    let cart = guestToken
      ? await db.cart.findUnique({ where: { guestToken } })
      : null;

    if (!cart) {
      const newToken = crypto.randomUUID();
      cart = await db.cart.create({ data: { guestToken: newToken } });
      setGuestCookie(resHeaders, newToken);
    }
    cartId = cart.id;
  }

  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
    });
  } else {
    await db.cartItem.create({ data: { cartId, productId, quantity: 1 } });
  }
}

export async function updateItem(
  cartItemId: string,
  quantity: number,
  userId: string | null,
  guestToken: string | null
): Promise<void> {
  const cart = await findCart(userId, guestToken);
  if (!cart) throw new Error("Cart not found");

  const item = await db.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });
  if (!item) throw new Error("Item not found");

  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }
}

export async function removeItem(
  cartItemId: string,
  userId: string | null,
  guestToken: string | null
): Promise<void> {
  const cart = await findCart(userId, guestToken);
  if (!cart) throw new Error("Cart not found");

  const item = await db.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });
  if (!item) throw new Error("Item not found");

  await db.cartItem.delete({ where: { id: cartItemId } });
}
