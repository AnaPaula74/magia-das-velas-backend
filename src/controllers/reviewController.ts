import type { Request, Response } from "express";
import { ReviewService } from "../services/reviewService.js";
import { logger } from "../utils/logger.js";
import { ValidationError } from "../errors/customErrors.js";

const reviewService = new ReviewService();

export class ReviewController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId, rating, comment } = req.body;

      // valida produto e nota
      if (!productId || !rating) throw new ValidationError("Produto e nota são obrigatórios");
      if (rating < 1 || rating > 5) throw new ValidationError("Nota deve estar entre 1 e 5");

      const result = await reviewService.create(userId, Number(productId), Number(rating), comment);
      logger.info(`Review criada para produto ${productId} por usuário ${userId}`);
      return res.json({ success: true, message: "Review criada", data: result });
    } catch (error: any) {
      logger.error("Erro ao criar review", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async getByProduct(req: Request, res: Response) {
    try {
      const productId = Number(req.params.productId);
      if (!productId) throw new ValidationError("ID do produto inválido");

      const reviews = await reviewService.getByProduct(productId);
      const average = await reviewService.getAverage(productId);

      logger.info(`Reviews consultadas para produto ${productId}`);
      return res.json({ success: true, data: { average: average.average, reviews } });
    } catch (error: any) {
      logger.error("Erro ao buscar reviews", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
}
