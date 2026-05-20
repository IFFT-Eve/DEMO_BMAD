import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.string().min(1),
});

export const updateItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(0),
});

export const removeItemSchema = z.object({
  id: z.string().min(1),
});
