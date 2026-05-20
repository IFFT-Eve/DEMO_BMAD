import type { Metadata } from "next";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AppHeader } from "@/components/layout/AppHeader";
import { CartProvider } from "@/components/cart/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "bmad_demo",
  description: "A BMAD-method e-commerce demo storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TRPCProvider>
          <CartProvider>
            <AppHeader />
            {children}
          </CartProvider>
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
