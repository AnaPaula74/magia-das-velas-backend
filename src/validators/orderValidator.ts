import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "shipped", "delivered"]),
});
