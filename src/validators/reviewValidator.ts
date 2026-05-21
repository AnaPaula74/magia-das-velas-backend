import { z } from "zod";

// criação de review
export const createReviewSchema = z.object({
  productId: z.number().int().positive("Produto inválido"),
  rating: z.number().int().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
  comment: z.string().optional(),
});
