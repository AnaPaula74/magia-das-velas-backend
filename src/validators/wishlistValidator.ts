import { z } from "zod";

// adicionar produto à wishlist
export const addWishlistSchema = z.object({
  productId: z.number().int().positive("Produto inválido"),
});
