import { z } from "zod";

export const createPosSaleSchema = z.object({
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  paymentMethod: z.enum(["cash", "card", "pix", "mercadopago"]),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, "Informe ao menos um item para a venda"),
});

export const posSalesQuerySchema = z.object({
  paymentMethod: z.enum(["cash", "card", "pix", "mercadopago"]).optional(),
  status: z
    .enum(["pending", "paid", "cancelled", "shipped", "delivered"])
    .optional(),
});
