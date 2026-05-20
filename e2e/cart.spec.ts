import { test, expect } from "@playwright/test";

/**
 * Epic 3 — Shopping Cart
 * QA E2E test suite covering Stories 3.1–3.5.
 * Normal, edge, and abnormal cases are labelled per category.
 */

/** Navigate to a product detail page and wait for arrival. */
async function goToProduct(page: import("@playwright/test").Page, name: string | RegExp) {
  await page.getByRole("link", { name }).click();
  await expect(page).toHaveURL(/\/products\/.+/);
}

/** Add to cart from the current product detail page and wait for the badge to update.
 * Waits for network idle to ensure the server mutation is committed and cookie is set
 * before callers navigate away. */
async function addFromDetailPage(page: import("@playwright/test").Page, expectedCount: number) {
  await page.getByRole("button", { name: "Add to cart" }).click();
  const plural = expectedCount !== 1 ? "s" : "";
  await expect(
    page.getByRole("button", { name: new RegExp(`Open cart, ${expectedCount} item${plural}`, "i") })
  ).toBeVisible({ timeout: 5000 });
  await page.waitForLoadState("networkidle");
}

// ─── Story 3.1 — Add a product to the cart ─────────────────────────────────

test.describe("Story 3.1 — Add a product to the cart", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // NORMAL
  test("AC1+AC2: adding from product detail creates guest cart and shows badge", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);

    await page.getByRole("button", { name: "Add to cart" }).click();

    await expect(
      page.getByRole("button", { name: /Open cart, 1 item/i })
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Added to cart")).toBeVisible({ timeout: 3000 });
  });

  // NORMAL
  test("AC1: adding same product again increments quantity (no duplicate row)", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);

    await addFromDetailPage(page, 1);
    await addFromDetailPage(page, 2);
  });

  // NORMAL
  test("AC2: adding from catalog product card updates badge", async ({ page }) => {
    await page.goto("/");

    const card = page.locator("div.rounded-lg").filter({ hasText: /Classic Tee/ }).first();
    await card.getByRole("button", { name: "Add to cart" }).click();

    await expect(
      page.getByRole("button", { name: /Open cart, 1 item/i })
    ).toBeVisible({ timeout: 5000 });
  });

  // EDGE
  test("AC2: cart icon shows no badge when cart is empty", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open cart" })).toBeVisible();
  });

  // ABNORMAL
  test("AC1+AC2: in-stock product has enabled Add to cart button", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });
});

// ─── Story 3.2 — View the cart in a slide-over drawer ──────────────────────

test.describe("Story 3.2 — View the cart drawer", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // NORMAL
  test("AC1: cart icon opens drawer showing items and total", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await addFromDetailPage(page, 1);

    await page.getByRole("button", { name: /Open cart/i }).click();

    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await expect(page.getByLabel("Cart items").getByText("Classic Tee")).toBeVisible();
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  // NORMAL
  test("AC2: cart persists across page navigation", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await addFromDetailPage(page, 1);

    // Navigate back to catalog
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /Open cart, 1 item/i })
    ).toBeVisible({ timeout: 5000 });
  });

  // NORMAL (empty state)
  test("AC3: empty cart drawer shows empty state message and browse CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open cart" }).click();

    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse products" })).toBeVisible();
  });

  // EDGE
  test("AC4: drawer closes via close button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open cart" }).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).not.toBeVisible();
  });

  // EDGE
  test("AC4: pressing Escape closes the drawer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open cart" }).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Your Cart" })).not.toBeVisible();
  });
});

// ─── Story 3.3 — Update item quantity ──────────────────────────────────────

test.describe("Story 3.3 — Update item quantity", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await addFromDetailPage(page, 1);
  });

  // NORMAL
  test("AC1: increase quantity updates the quantity display", async ({ page }) => {
    await page.getByRole("button", { name: /Open cart/i }).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();

    // Quantity shows 1
    await expect(page.getByLabel("Quantity: 1")).toBeVisible();

    await page.getByRole("button", { name: /Increase quantity of Classic Tee/i }).click();

    // Quantity updates to 2 (optimistic)
    await expect(page.getByLabel("Quantity: 2")).toBeVisible({ timeout: 3000 });
  });

  // NORMAL
  test("AC1: decrease quantity updates the quantity display", async ({ page }) => {
    await page.getByRole("button", { name: /Open cart/i }).click();

    // Increase to 2 first
    await page.getByRole("button", { name: /Increase quantity of Classic Tee/i }).click();
    await expect(page.getByLabel("Quantity: 2")).toBeVisible({ timeout: 3000 });

    // Decrease back to 1
    await page.getByRole("button", { name: /Decrease quantity of Classic Tee/i }).click();
    await expect(page.getByLabel("Quantity: 1")).toBeVisible({ timeout: 3000 });
  });

  // EDGE
  test("AC2: decreasing quantity to 0 removes item from cart", async ({ page }) => {
    await page.getByRole("button", { name: /Open cart/i }).click();
    await expect(page.getByLabel("Cart items").getByText("Classic Tee")).toBeVisible();

    await page.getByRole("button", { name: /Decrease quantity of Classic Tee/i }).click();

    await expect(page.getByText("Your cart is empty")).toBeVisible({ timeout: 5000 });
  });
});

// ─── Story 3.4 — Remove an item from the cart ──────────────────────────────

test.describe("Story 3.4 — Remove an item", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await addFromDetailPage(page, 1);
  });

  // NORMAL
  test("AC1: remove button removes item and shows empty state", async ({ page }) => {
    await page.getByRole("button", { name: /Open cart/i }).click();
    await expect(page.getByLabel("Cart items").getByText("Classic Tee")).toBeVisible();

    await page.getByRole("button", { name: /Remove Classic Tee from cart/i }).click();

    await expect(page.getByText("Your cart is empty")).toBeVisible({ timeout: 5000 });
  });

  // EDGE
  test("AC1: removing last item hides Checkout link", async ({ page }) => {
    await page.getByRole("button", { name: /Open cart/i }).click();
    await page.getByRole("button", { name: /Remove Classic Tee from cart/i }).click();

    await expect(page.getByText("Your cart is empty")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: "Checkout" })).not.toBeVisible();
  });

  // EDGE
  test("AC1: multiple items — removing one leaves the other", async ({ page }) => {
    // Add a second product from the catalog (navigate back first)
    await page.goto("/");
    const beanieCard = page.locator("div.rounded-lg").filter({ hasText: /Wool Beanie/ }).first();
    await beanieCard.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("button", { name: /Open cart, 2 items/i })).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: /Open cart/i }).click();
    const cartList = page.getByLabel("Cart items");
    await expect(cartList.getByText("Classic Tee")).toBeVisible();
    await expect(cartList.getByText("Wool Beanie")).toBeVisible();

    await page.getByRole("button", { name: /Remove Classic Tee from cart/i }).click();

    await expect(cartList.getByText("Classic Tee")).not.toBeVisible({ timeout: 5000 });
    await expect(cartList.getByText("Wool Beanie")).toBeVisible();
  });
});

// ─── Story 3.5 — Prevent checkout from empty cart ──────────────────────────

test.describe("Story 3.5 — Prevent checkout from empty cart", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // NORMAL
  test("AC3: Checkout link visible when cart has items", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await addFromDetailPage(page, 1);

    await page.getByRole("button", { name: /Open cart/i }).click();
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  // NORMAL
  test("AC1: Checkout link absent when cart is empty", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open cart" }).click();

    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Checkout" })).not.toBeVisible();
  });

  // ABNORMAL
  test("AC2: direct navigation to /checkout with empty cart redirects to catalog", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL("/");
  });

  // EDGE
  test("AC2: direct navigation to /checkout with items does not redirect", async ({ page }) => {
    await page.goto("/");
    await goToProduct(page, /Classic Tee/i);
    await addFromDetailPage(page, 1);

    await page.goto("/checkout");
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  });
});
