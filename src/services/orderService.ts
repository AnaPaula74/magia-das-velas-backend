// src/services/orderService.ts

import { logger } from "../utils/logger.js";

import {
  NotFoundError,
  ValidationError,
} from "../errors/customErrors.js";

import OrderRepository from "../repositories/orderRepository.js";

import type { CheckoutDTO } from "../dtos/order/checkout.dto.js";
import type { UpdateOrderStatusDTO } from "../dtos/order/updateOrderStatus.dto.js";

import { OrderStatus } from "../enums/orderStatus.js";

export class OrderService {
  constructor(
    private orderRepository =
      new OrderRepository()
  ) {}

  async checkout(dto: CheckoutDTO) {
    const conn =
      await this.orderRepository.getConnection();

    try {
      await conn.beginTransaction();

      const items =
        await this.orderRepository.getCartItemsForCheckout(
          conn,
          dto.userId
        );

      if (items.length === 0) {
        throw new NotFoundError(
          "Carrinho vazio"
        );
      }

      for (const item of items) {
        const product =
          await this.orderRepository.getProductStockForUpdate(
            conn,
            item.product_id
          );

        if (
          !product ||
          product.stock < item.quantity
        ) {
          throw new ValidationError(
            `Estoque insuficiente para produto ID ${item.product_id}`
          );
        }
      }

      const total = items.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            item.quantity,
        0
      );

      const orderResult =
        await this.orderRepository.createOrder(
          conn,
          dto.userId,
          total,
          OrderStatus.PENDING
        );

      const orderId =
        orderResult.insertId;

      for (const item of items) {
        await this.orderRepository.createOrderItem(
          conn,
          orderId,
          item.product_id,
          item.quantity,
          Number(item.price)
        );

        await this.orderRepository.decreaseStock(
          conn,
          item.product_id,
          item.quantity
        );
      }

      await this.orderRepository.clearCart(
        conn,
        dto.userId
      );

      await conn.commit();

      logger.info(
        `Pedido criado: ${orderId}`
      );

      return {
        orderId,
        total,
        items,
        status: OrderStatus.PENDING,
      };
    } catch (error) {
      await conn.rollback();

      logger.error(
        "Erro no checkout",
        { error }
      );

      throw error;
    } finally {
      conn.release();
    }
  }

  async getOrders(userId: number) {
    return this.orderRepository.getOrdersByUser(
      userId
    );
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await this.orderRepository.getOrderByIdForUser(
      orderId,
      userId
    );

    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }

    const items = await this.orderRepository.getOrderItems(orderId);

    return {
      ...order,
      items,
    };
  }

  async updateStatus(
    dto: UpdateOrderStatusDTO
  ) {
    const result =
      await this.orderRepository.updateStatus(
        dto.orderId,
        dto.status
      );

    if (result.affectedRows === 0) {
      throw new NotFoundError(
        "Pedido não encontrado"
      );
    }

    return result;
  }
}
