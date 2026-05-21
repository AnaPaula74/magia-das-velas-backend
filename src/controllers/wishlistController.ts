import type { Request, Response } from "express";
import { WishlistService } from "../services/wishlistService.js";
import { logger } from "../utils/logger.js";
import { ValidationError } from "../errors/customErrors.js";

const wishlistService = new WishlistService();

export class WishlistController {
  async add(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;
      // valida se produto foi enviado
      if (!productId) throw new ValidationError("Produto é obrigatório");

      const result = await wishlistService.add(userId, Number(productId));
      logger.info(`Produto ${productId} adicionado à wishlist do usuário ${userId}`);
      return res.json({ success: true, message: "Adicionado aos favoritos", data: result });
    } catch (error: any) {
      logger.error("Erro ao adicionar favorito", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const productId = Number(req.params.productId);
      // valida id do produto
      if (!productId) throw new ValidationError("ID do produto inválido");

      const result = await wishlistService.remove(userId, productId);
      logger.info(`Produto ${productId} removido da wishlist do usuário ${userId}`);
      return res.json({ success: true, message: "Removido dos favoritos", data: result });
    } catch (error: any) {
      logger.error("Erro ao remover favorito", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      // consulta wishlist do usuário
      const result = await wishlistService.list(userId);
      logger.info(`Wishlist consultada pelo usuário ${userId}`);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error("Erro ao listar favoritos", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
}
