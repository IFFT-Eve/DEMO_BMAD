import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { addItemSchema, updateItemSchema, removeItemSchema } from "@/lib/schemas/cart";
import * as cartService from "../services/cartService";

export const cartRouter = router({
  get: publicProcedure.query(({ ctx }) =>
    cartService.get(ctx.user?.id ?? null, ctx.guestToken)
  ),

  addItem: publicProcedure
    .input(addItemSchema)
    .mutation(({ ctx, input }) =>
      cartService.addItem(
        input.productId,
        ctx.user?.id ?? null,
        ctx.guestToken,
        ctx.resHeaders
      )
    ),

  updateItem: publicProcedure
    .input(updateItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await cartService.updateItem(
          input.id,
          input.quantity,
          ctx.user?.id ?? null,
          ctx.guestToken
        );
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
      }
    }),

  removeItem: publicProcedure
    .input(removeItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await cartService.removeItem(
          input.id,
          ctx.user?.id ?? null,
          ctx.guestToken
        );
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
      }
    }),
});
