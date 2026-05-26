// src/services/wishlistService.ts

import { logger } from "../utils/logger.js";

import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/customErrors.js";

import WishlistRepository from "../repositories/wishlistRepository.js";

import type { AddWishlistDTO } from "../dtos/wishlist/addWishlist.dto.js";
import type { RemoveWishlistItemDTO } from "../dtos/wishlist/removeWishlistItem.dto.js";

export class WishlistService {
  constructor(
    private wishlistRepository =
      new WishlistRepository()
  ) {}

  async add(dto: AddWishlistDTO): Promise<unknown>;
  async add(userId: number, productId: number): Promise<unknown>;
  async add(input: AddWishlistDTO | number, productId?: number) {
    const dto =
      typeof input === "number"
        ? { userId: input, productId: productId ?? 0 }
        : input;

    if (!dto.productId) {
      throw new ValidationError(
        "Produto inválido"
      );
    }

    const product = await this.wishlistRepository.findProductById(dto.productId);

    if (!product) {
      throw new NotFoundError("Produto não encontrado");
    }

    const existing =
      await this.wishlistRepository.findItem(
        dto.userId,
        dto.productId
      );

    if (existing) {
      throw new ConflictError(
        "Produto já está na wishlist"
      );
    }

    const result =
      await this.wishlistRepository.add(
        dto.userId,
        dto.productId
      );

    logger.info(
      `Wishlist atualizada`
    );

    return result;
  }

  async remove(dto: RemoveWishlistItemDTO): Promise<unknown>;
  async remove(userId: number, productId: number): Promise<unknown>;
  async remove(
    input: RemoveWishlistItemDTO | number,
    productId?: number
  ) {
    const dto =
      typeof input === "number"
        ? { userId: input, productId: productId ?? 0 }
        : input;

    const result =
      await this.wishlistRepository.remove(
        dto.userId,
        dto.productId
      );

    if (result.affectedRows === 0) {
      throw new NotFoundError(
        "Produto não encontrado"
      );
    }

    return result;
  }

  async list(userId: number) {
    const rows =
      await this.wishlistRepository.list(
        userId
      );

    return {
      items: rows,
      total: rows.length,
    };
  }

  async exists(userId: number, productId: number): Promise<boolean> {
    const item = await this.wishlistRepository.findItem(userId, productId);

    return Boolean(item);
  }
}
