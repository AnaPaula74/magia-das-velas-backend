// src/services/cartService.ts

import { logger } from "../utils/logger.js";

import {
  ValidationError,
  NotFoundError,
} from "../errors/customErrors.js";

import CartRepository from "../repositories/cartRepository.js";

import type { AddCartItemDTO } from "../dtos/cart/addCartItem.dto.js";
import type { UpdateCartItemDTO } from "../dtos/cart/updateCartItem.dto.js";
import type { RemoveCartItemDTO } from "../dtos/cart/removeCartItem.dto.js";
import type { GetCartDTO } from "../dtos/cart/getCart.dto.js";

export default class CartService {
  constructor(
    private cartRepository =
      new CartRepository()
  ) {}

  async addToCart(dto: AddCartItemDTO): Promise<unknown>;
  async addToCart(userId: number, productId: number, quantity: number): Promise<unknown>;
  async addToCart(
    input: AddCartItemDTO | number,
    productId?: number,
    quantity?: number
  ) {
    const dto =
      typeof input === "number"
        ? { userId: input, productId: productId ?? 0, quantity: quantity ?? 0 }
        : input;

    if (dto.quantity <= 0) {
      throw new ValidationError(
        "Quantidade deve ser maior que zero"
      );
    }

    const product =
      await this.cartRepository.findProductById(
        dto.productId
      );

    if (!product) {
      throw new NotFoundError(
        "Produto não encontrado"
      );
    }

    if (product.stock < dto.quantity) {
      throw new ValidationError(
        "Estoque insuficiente"
      );
    }

    const existingItem =
      await this.cartRepository.findItem(
        dto.userId,
        dto.productId
      );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + dto.quantity;

      if (product.stock < newQuantity) {
        throw new ValidationError(
          "Estoque insuficiente"
        );
      }

      const result =
        await this.cartRepository.updateItemQuantity(
          dto.userId,
          existingItem.id,
          newQuantity
        );

      logger.info(
        `Carrinho atualizado: usuário ${dto.userId}`
      );

      return result;
    }

    const result =
      await this.cartRepository.createItem(
        dto.userId,
        dto.productId,
        dto.quantity
      );

    logger.info(
      `Produto adicionado ao carrinho`
    );

    return result;
  }

  async getCart(dto: GetCartDTO): Promise<{ items: unknown[]; total: number }>;
  async getCart(userId: number): Promise<{ items: unknown[]; total: number }>;
  async getCart(input: GetCartDTO | number) {
    const dto =
      typeof input === "number"
        ? { userId: input }
        : input;

    const items =
      await this.cartRepository.getByUser(
        dto.userId
      );

    if (!items.length) {
      return {
        items,
        total: 0,
      };
    }

    const total = items.reduce(
      (sum, item) =>
        sum + Number(item.subtotal),
      0
    );

    return {
      items,
      total,
    };
  }

  async updateQuantity(dto: UpdateCartItemDTO): Promise<unknown>;
  async updateQuantity(userId: number, cartItemId: number, quantity: number): Promise<unknown>;
  async updateQuantity(
    input: UpdateCartItemDTO | number,
    cartItemId?: number,
    quantity?: number
  ) {
    const dto =
      typeof input === "number"
        ? { userId: input, cartItemId: cartItemId ?? 0, quantity: quantity ?? 0 }
        : input;

    if (dto.quantity <= 0) {
      throw new ValidationError(
        "Quantidade deve ser maior que zero"
      );
    }

    const item = await this.cartRepository.findItemByIdForUser(
      dto.userId,
      dto.cartItemId
    );

    if (!item) {
      throw new NotFoundError(
        "Item não encontrado"
      );
    }

    const product = await this.cartRepository.findProductById(item.product_id);

    if (!product) {
      throw new NotFoundError(
        "Produto não encontrado"
      );
    }

    if (product.stock < dto.quantity) {
      throw new ValidationError(
        "Estoque insuficiente"
      );
    }

    const result =
      await this.cartRepository.updateItemQuantity(
        dto.userId,
        dto.cartItemId,
        dto.quantity
      );

    if (result.affectedRows === 0) {
      throw new NotFoundError(
        "Item não encontrado"
      );
    }

    logger.info(
      `Carrinho atualizado`
    );

    return result;
  }

  async removeFromCart(dto: RemoveCartItemDTO): Promise<unknown>;
  async removeFromCart(userId: number, cartItemId: number): Promise<unknown>;
  async removeFromCart(
    input: RemoveCartItemDTO | number,
    cartItemId?: number
  ) {
    const dto =
      typeof input === "number"
        ? { userId: input, cartItemId: cartItemId ?? 0 }
        : input;

    const result =
      await this.cartRepository.deleteItem(
        dto.userId,
        dto.cartItemId
      );

    if (result.affectedRows === 0) {
      throw new NotFoundError(
        "Item não encontrado"
      );
    }

    logger.info(
      `Item removido do carrinho`
    );

    return result;
  }

  async clearCart(userId: number) {
    const result = await this.cartRepository.clearByUser(userId);

    logger.info(`Carrinho limpo: usuário ${userId}`);

    return result;
  }
}
