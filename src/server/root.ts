import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { productRouter } from "./routers/product";
import { cartRouter } from "./routers/cart";

export const appRouter = router({
  health: healthRouter,
  product: productRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;
