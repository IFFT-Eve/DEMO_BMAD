import Link from "next/link";
import { CartIconButton } from "@/components/cart/CartIconButton";

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          bmad_demo
        </Link>
        <div className="flex items-center gap-4">
          <CartIconButton />
          <Link
            href="/login"
            className="text-sm font-medium text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
