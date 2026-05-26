import type { Request, Response } from "express";

import { ReviewService } from "../services/reviewService.js";
import AuditService from "../services/auditService.js";
import type { CreateReviewDTO } from "../dtos/review/createReview.dto.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class ReviewController {
  constructor(
    private reviewService = new ReviewService(),
    private auditService = new AuditService()
  ) {}

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.body.productId);
      const rating = Number(req.body.rating);
      const comment = req.body.comment?.trim();

      if (isNaN(productId) || productId <= 0) {
        return failure(res, 400, "ID do produto inválido");
      }

      if (isNaN(rating) || rating < 1 || rating > 5) {
        return failure(res, 400, "Avaliação deve estar entre 1 e 5 estrelas");
      }

      if (comment && (comment.length < 3 || comment.length > 1000)) {
        return failure(res, 400, "Comentário deve ter entre 3 e 1000 caracteres");
      }

      const dto: CreateReviewDTO = {
        userId: req.user.id,
        productId,
        rating,
        comment,
      };

      const result = await this.reviewService.create(dto);

      await this.auditService.log({
        userId: dto.userId,
        action: "REVIEW_CREATE",
        details: `Review criada para produto ${dto.productId} com ${dto.rating} estrelas`,
      });

      logger.info(
        `Review criada para produto ${productId} pelo usuário ${req.user.id} com ${rating} estrelas`
      );

      return success(res, 201, "Review criada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao criar review", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar review")
      );
    }
  }

  async getByProduct(req: Request, res: Response) {
    try {
      const productId = Number(req.params.productId);

      if (isNaN(productId) || productId <= 0) {
        return failure(res, 400, "ID do produto inválido");
      }

      const page = Math.max(1, Number(req.query?.page ?? 1));
      const limit = Math.min(50, Math.max(1, Number(req.query?.limit ?? 10)));

      const reviews = await this.reviewService.getByProduct(productId, page, limit);
      const average = await this.reviewService.getAverage(productId);

      logger.info(
        `Reviews listadas para produto ${productId}: ${reviews.length} reviews, média ${average.average || 0}`
      );

      return success(res, 200, "Reviews listadas com sucesso", {
        average: average.average || 0,
        totalRatings: average.totalRatings || 0,
        reviews,
        pagination: {
          page,
          limit,
          total: reviews.length,
        },
      });
    } catch (error: unknown) {
      logger.error("Erro ao listar reviews", { productId: req.params.productId, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar reviews")
      );
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const reviewId = Number(req.params.id);

      if (isNaN(reviewId) || reviewId <= 0) {
        return failure(res, 400, "ID da review inválido");
      }

      const result = await this.reviewService.delete(reviewId, req.user.id);

      await this.auditService.log({
        userId: req.user.id,
        action: "REVIEW_DELETE",
        details: `Review ${reviewId} deletada`,
      });

      logger.info(`Review ${reviewId} deletada pelo usuário ${req.user.id}`);

      return success(res, 200, "Review deletada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao deletar review", {
        reviewId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao deletar review")
      );
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const reviewId = Number(req.params.id);

      if (isNaN(reviewId) || reviewId <= 0) {
        return failure(res, 400, "ID da review inválido");
      }

      const rating = req.body.rating ? Number(req.body.rating) : undefined;
      const comment = req.body.comment?.trim();

      if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) {
        return failure(res, 400, "Avaliação deve estar entre 1 e 5 estrelas");
      }

      if (comment && (comment.length < 3 || comment.length > 1000)) {
        return failure(res, 400, "Comentário deve ter entre 3 e 1000 caracteres");
      }

      const result = await this.reviewService.update(reviewId, req.user.id, {
        rating,
        comment,
      });

      await this.auditService.log({
        userId: req.user.id,
        action: "REVIEW_UPDATE",
        details: `Review ${reviewId} atualizada`,
      });

      logger.info(`Review ${reviewId} atualizada pelo usuário ${req.user.id}`);

      return success(res, 200, "Review atualizada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao atualizar review", {
        reviewId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar review")
      );
    }
  }
}

const controller = new ReviewController();
export default controller;
