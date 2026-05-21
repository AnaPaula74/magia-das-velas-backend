import { z } from "zod";

// atualizar status do pedido
export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered"]),
});
