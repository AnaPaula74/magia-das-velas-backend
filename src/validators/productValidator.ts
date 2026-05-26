import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nome do produto deve ter no mínimo 3 caracteres"),

  description: z
    .string()
    .trim()
    .min(5, "Descrição muito curta"),

  price: z.coerce
    .number()
    .positive("Preço deve ser positivo"),

  stock: z.coerce
    .number()
    .int()
    .nonnegative("Estoque não pode ser negativo"),

  categoryId: z.coerce
    .number()
    .int()
    .positive("Categoria inválida")
    .optional(),

  image_url: z
    .string()
    .optional(),
});

export const updateProductSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });