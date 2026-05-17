import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { productRouter } from "./routers/product";

export const appRouter = router({
  health: healthRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
