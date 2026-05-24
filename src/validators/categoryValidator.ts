import { z } from "zod";

export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome da categoria muito curto")
    .max(255, "Nome da categoria muito longo"),
  description: z.string()
    .max(500, "Descrição muito longa")
    .optional(),
});
