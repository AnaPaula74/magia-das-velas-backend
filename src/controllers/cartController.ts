import type { Request, Response } from "express";
import CartService from "../services/cartService.js";
import { logger } from "../utils/logger.js";

const cartService = new CartService();

export class CartController {
  async add(req: Request, res: Response) {
    try {
      const { productId, quantity } = req.body;
      const user = req.user as { id: number };
      // valida produto e quantidade
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, error: "Produto e quantidade válidos são obrigatórios" });
      }
      const result = await cartService.addToCart(user.id, Number(productId), Number(quantity));
      logger.info(`Produto ${productId} adicionado ao carrinho do usuário ${user.id}`);
      return res.status(201).json({ success: true, message: "Produto adicionado", data: result });
    } catch (error: any) {
      logger.error("Erro ao adicionar ao carrinho", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const user = req.user as { id: number };
      const cart = await cartService.getCart(user.id);
      logger.info(`Carrinho consultado pelo usuário ${user.id}`);
      return res.json({ success: true, data: cart });
    } catch (error: any) {
      logger.error("Erro ao buscar carrinho", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { quantity } = req.body;
      // quantidade precisa ser maior que zero
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, error: "Quantidade deve ser maior que zero" });
      }
      const result = await cartService.updateQuantity(id, Number(quantity));
      logger.info(`Item ${id} atualizado para quantidade ${quantity}`);
      return res.json({ success: true, message: "Quantidade atualizada", data: result });
    } catch (error: any) {
      logger.error("Erro ao atualizar carrinho", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await cartService.removeFromCart(id);
      logger.info(`Item ${id} removido do carrinho`);
      return res.json({ success: true, message: "Item removido", data: result });
    } catch (error: any) {
      logger.error("Erro ao remover item do carrinho", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
}
