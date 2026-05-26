import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.coerce.number().int().positive("Produto inválido"),

  rating: z.coerce
    .number()
    .int()
    .min(1, "Nota mínima é 1")
    .max(5, "Nota máxima é 5"),

  comment: z
    .string()
    .trim()
    .min(3, "Comentário muito curto")
    .max(1000, "Comentário muito longo")
    .optional(),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce
      .number()
      .int()
      .min(1, "Nota mínima é 1")
      .max(5, "Nota máxima é 5")
      .optional(),

    comment: z
      .string()
      .trim()
      .min(3, "Comentário muito curto")
      .max(1000, "Comentário muito longo")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
