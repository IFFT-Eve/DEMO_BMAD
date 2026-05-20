import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as cartService from "@/server/services/cartService";

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const guestToken = cookieStore.get("guest_cart_token")?.value ?? null;
  const cart = await cartService.get(null, guestToken);

  if (!cart || cart.items.length === 0) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-[var(--font-heading)] font-semibold text-foreground mb-4">
        Checkout
      </h1>
      <p className="text-muted-foreground">
        Checkout flow coming in Epic 5.
      </p>
    </main>
  );
}
