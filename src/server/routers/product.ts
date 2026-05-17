import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { list, byId } from "../services/productService";

export const productRouter = router({
  list: publicProcedure.query(() => list()),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => byId(input.id)),
});
