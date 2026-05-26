// src/services/reviewService.ts

import { logger } from "../utils/logger.js";

import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/customErrors.js";

import ReviewRepository from "../repositories/reviewRepository.js";

import type { CreateReviewDTO } from "../dtos/review/createReview.dto.js";

export class ReviewService {
  constructor(
    private reviewRepository =
      new ReviewRepository()
  ) {}

  async create(dto: CreateReviewDTO): Promise<unknown>;
  async create(userId: number, productId: number, rating: number, comment?: string): Promise<unknown>;
  async create(
    input: CreateReviewDTO | number,
    productId?: number,
    rating?: number,
    comment?: string
  ) {
    const dto =
      typeof input === "number"
        ? {
            userId: input,
            productId: productId ?? 0,
            rating: rating ?? 0,
            comment,
          }
        : input;

    if (
      dto.rating < 1 ||
      dto.rating > 5
    ) {
      throw new ValidationError(
        "Nota deve estar entre 1 e 5"
      );
    }

    const existing =
      await this.reviewRepository.findByUserAndProduct(
        dto.userId,
        dto.productId
      );

    if (existing) {
      throw new ConflictError(
        "Você já avaliou este produto"
      );
    }

    const result =
      await this.reviewRepository.create(
        dto.userId,
        dto.productId,
        dto.rating,
        dto.comment
      );

    logger.info(
      `Review criada`
    );

    return result;
  }

  async getByProduct(productId: number, page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const rows =
      await this.reviewRepository.getByProduct(
        productId,
        safeLimit,
        offset
      );

    return rows;
  }

  async getAverage(productId: number) {
    const average =
      await this.reviewRepository.getAverage(
        productId
      );

    if (!average || average.average === null) {
      return {
        average: 0,
        totalRatings: 0,
      };
    }

    return average;
  }

  async update(
    reviewId: number,
    userId: number,
    data: { rating?: number | undefined; comment?: string | undefined }
  ) {
    const current = await this.reviewRepository.findByIdForUser(reviewId, userId);

    if (!current) {
      throw new NotFoundError("Review não encontrada");
    }

    const rating = data.rating ?? current.rating;

    if (rating < 1 || rating > 5) {
      throw new ValidationError("Nota deve estar entre 1 e 5");
    }

    const result = await this.reviewRepository.update(
      reviewId,
      userId,
      rating,
      data.comment ?? current.comment
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError("Review não encontrada");
    }

    return {
      id: reviewId,
      userId,
      rating,
      comment: data.comment ?? current.comment,
    };
  }

  async delete(reviewId: number, userId: number) {
    const result = await this.reviewRepository.delete(reviewId, userId);

    if (result.affectedRows === 0) {
      throw new NotFoundError("Review não encontrada");
    }

    return {
      id: reviewId,
      deleted: true,
    };
  }
}
