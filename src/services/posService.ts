import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../errors/customErrors.js";
import PosRepository from "../repositories/posRepository.js";
import type { CreatePosSaleDTO } from "../dtos/pos/createPosSale.dto.js";
import { OrderStatus } from "../enums/orderStatus.js";

export type UserRoleType = "user" | "admin" | "cashier";

export class PosService {
  constructor(private posRepository = new PosRepository()) {}

  async createSale(dto: CreatePosSaleDTO, userId: number) {
    const conn = await this.posRepository.getConnection();

    try {
      await conn.beginTransaction();

      const saleItems = [] as Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        name: string;
      }>;

      let total = 0;

      for (const item of dto.items) {
        const product = await this.posRepository.getProductByIdForUpdate(
          conn,
          item.productId
        );

        if (!product) {
          throw new NotFoundError(`Produto não encontrado: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new ValidationError(
            `Estoque insuficiente para produto ID ${item.productId}`
          );
        }

        const unitPrice = Number(product.physical_price);

        total += unitPrice * item.quantity;

        saleItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          name: product.name,
        });
      }

      const createdOrder = await this.posRepository.createOrder(
        conn,
        userId,
        total,
        OrderStatus.PAID,
        "pos",
        dto.paymentMethod,
        userId,
        dto.customerName?.trim() ?? null,
        dto.customerPhone?.trim() ?? null,
        new Date()
      );

      const orderId = createdOrder.insertId;

      for (const item of saleItems) {
        await this.posRepository.createOrderItem(
          conn,
          orderId,
          item.productId,
          item.quantity,
          item.unitPrice
        );

        await this.posRepository.decreaseStock(
          conn,
          item.productId,
          item.quantity
        );
      }

      await conn.commit();

      logger.info(`Venda POS criada: ${orderId}`);

      const sale = await this.posRepository.getSaleById(orderId);
      const items = await this.posRepository.getSaleItems(orderId);

      if (!sale) {
        throw new NotFoundError("Venda POS criada não encontrada");
      }

      return {
        ...sale,
        orderId,
        items,
      };
    } catch (error) {
      await conn.rollback();
      logger.error("Erro ao criar venda POS", { error });
      throw error;
    } finally {
      conn.release();
    }
  }

  async getSales(userId: number, role: UserRoleType, filters: { paymentMethod?: string; status?: string }) {
    const soldByUserId = role === "cashier" ? userId : undefined;
    return this.posRepository.getSales(soldByUserId, filters.paymentMethod, filters.status);
  }

  async getSaleById(orderId: number, userId: number, role: UserRoleType) {
    const sale = await this.posRepository.getSaleById(orderId);

    if (!sale) {
      throw new NotFoundError("Venda não encontrada");
    }

    if (role === "cashier" && sale.sold_by_user_id !== userId) {
      throw new NotFoundError("Venda não encontrada");
    }

    const items = await this.posRepository.getSaleItems(orderId);

    return {
      ...sale,
      items,
    };
  }

  async cancelSale(orderId: number) {
    const sale = await this.posRepository.getSaleById(orderId);

    if (!sale) {
      throw new NotFoundError("Venda não encontrada");
    }

    if (sale.status === OrderStatus.CANCELLED) {
      throw new ValidationError("Venda já cancelada");
    }

    if (sale.status !== OrderStatus.PAID) {
      throw new ValidationError("Somente vendas finalizadas podem ser canceladas");
    }

    const items = await this.posRepository.getSaleItems(orderId);

    if (!items.length) {
      throw new ValidationError("Itens da venda não encontrados");
    }

    const conn = await this.posRepository.getConnection();

    try {
      await conn.beginTransaction();

      const result = await this.posRepository.cancelSale(conn, orderId);

      if (result.affectedRows === 0) {
        throw new NotFoundError("Venda não encontrada");
      }

      for (const item of items) {
        await this.posRepository.increaseStock(
          conn,
          item.product_id,
          item.quantity
        );
      }

      await conn.commit();

      logger.info(`Venda POS cancelada: ${orderId}`);

      return {
        orderId,
        status: OrderStatus.CANCELLED,
        cancelled: true,
      };
    } catch (error) {
      await conn.rollback();
      logger.error("Erro ao cancelar venda POS", { error });
      throw error;
    } finally {
      conn.release();
    }
  }
}
