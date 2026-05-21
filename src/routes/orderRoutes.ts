import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { updateOrderStatusSchema } from "../validators/orderValidator.js";
import { logger } from "../utils/logger.js";

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Endpoints de pedidos
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Finaliza pedido
 *     tags: [Order]
 *     responses:
 *       201: { description: Pedido criado }
 *       400: { description: Erro de validação }
 */
router.post("/checkout", authMiddleware, (req, res) => {
  logger.info("Rota POST /orders/checkout acessada");
  orderController.checkout(req, res);
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista pedidos do usuário
 *     tags: [Order]
 *     responses:
 *       200: { description: Lista de pedidos }
 *       404: { description: Nenhum pedido encontrado }
 */
router.get("/", authMiddleware, (req, res) => {
  logger.info("Rota GET /orders acessada");
  orderController.getOrders(req, res);
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualiza status do pedido
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Status atualizado }
 *       404: { description: Pedido não encontrado }
 */
router.patch("/:id/status", authMiddleware, validate(updateOrderStatusSchema), (req, res) => {
  logger.info("Rota PATCH /orders/:id/status acessada");
  orderController.updateStatus(req, res);
});

export default router;
