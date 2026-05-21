import type { Request, Response } from "express";
import { OrderService } from "../services/orderService.js";
import { logger } from "../utils/logger.js";
import { ValidationError, NotFoundError } from "../errors/customErrors.js";

const orderService = new OrderService();

export class OrderController {
  async checkout(req: Request, res: Response) {
    try {
      const user = req.user as { id: number };
      const order = await orderService.checkout(user.id);
      logger.info(`Pedido criado para usuário ${user.id}`);
      return res.status(201).json({ success: true, message: "Pedido criado", data: order });
    } catch (error: any) {
      logger.error("Erro ao finalizar pedido", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const user = req.user as { id: number };
      const orders = await orderService.getOrders(user.id);
      logger.info(`Pedidos consultados pelo usuário ${user.id}`);
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      logger.error("Erro ao buscar pedidos", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
  async updateStatus(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;
      const validStatus = ["pending", "paid", "processing", "shipped", "delivered"];
      // valida se status enviado é permitido
      if (!validStatus.includes(status)) {
        throw new ValidationError("Status inválido");
      }

      const updatedOrder = await orderService.updateStatus(orderId, status);
      if (!updatedOrder) {
        throw new NotFoundError("Pedido não encontrado");
      }

      logger.info(`Status do pedido ${orderId} atualizado para ${status}`);
      return res.json({ success: true, message: "Status atualizado", data: { orderId, status } });
    } catch (error: any) {
      logger.error("Erro ao atualizar status do pedido", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
}