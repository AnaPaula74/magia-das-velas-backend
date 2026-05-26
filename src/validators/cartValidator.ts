import { z } from "zod";

export const addCartSchema = z.object({
  productId: z.coerce.number().int().positive("Produto inválido"),
  quantity: z.coerce.number().int().positive("Quantidade deve ser maior que zero"),
});

export const updateCartSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantidade deve ser maior que zero"),
});