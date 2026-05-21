import { z } from "zod";

// adicionar item ao carrinho
export const addCartSchema = z.object({
  productId: z.number().int().positive("Produto inválido"),
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
});

// atualizar quantidade do item
export const updateCartSchema = z.object({
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
});
