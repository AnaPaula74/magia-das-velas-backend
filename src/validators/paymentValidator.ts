import { z } from "zod";

// schema para pagamento Pix

export const pixPaymentSchema = z.object({
  amount: z
    .number({
      message: "Valor inválido",
    })
    .positive("Valor deve ser maior que zero"),

  description: z
    .string({
      message: "Descrição inválida",
    })
    .min(3, "Descrição muito curta"),

  email: z
    .string({
      message: "E-mail inválido",
    })
    .email("E-mail inválido"),
});

// schema para checkout Mercado Pago

export const mercadoPagoSchema = z.object({
  amount: z
    .number({
      message: "Valor inválido",
    })
    .positive("Valor deve ser maior que zero"),

  description: z
    .string({
      message: "Descrição inválida",
    })
    .min(3, "Descrição muito curta"),
});