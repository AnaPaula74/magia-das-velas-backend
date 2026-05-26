import { z } from "zod";

export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome da categoria deve ter no mínimo 3 caracteres")
    .max(255, "Nome da categoria muito longo"),
  description: z.string()
    .trim()
    .max(500, "Descrição muito longa")
    .optional(),
});

export const updateCategorySchema = categorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
