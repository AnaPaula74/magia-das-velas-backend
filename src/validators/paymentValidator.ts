import { z } from "zod";

export const pixPaymentSchema = z.object({
  orderId: z.coerce
    .number()
    .int()
    .positive("Pedido inválido"),
});

export const mercadoPagoSchema = z.object({
  orderId: z.coerce
    .number()
    .int()
    .positive("Pedido inválido"),
});

export const paymentReferenceParamSchema = z.object({
  id: z.string()
    .trim()
    .min(1, "ID do pagamento inválido")
    .max(255, "ID do pagamento muito longo"),
});
