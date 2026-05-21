import { z } from "zod";

// criação/edição de produto
export const productSchema = z.object({
  name: z.string().min(2, "Nome do produto muito curto"),
  description: z.string().min(5, "Descrição muito curta"),
  price: z.number().positive("Preço deve ser positivo"),
  stock: z.number().int().nonnegative("Estoque não pode ser negativo"),
  image_url: z.string().url("URL inválida").optional(),
});
