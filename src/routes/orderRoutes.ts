import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { updateOrderStatusSchema } from "../validators/orderValidator.js";

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Endpoints de pedidos
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Finaliza pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             cartId: 123
 *             paymentMethod: "pix"
 *     responses:
 *       201:
 *         description: Pedido criado
 *       400:
 *         description: Erro de validação
 */
router.post("/checkout", authMiddleware, (req, res) => orderController.checkout(req, res));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista pedidos do usuário
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       404:
 *         description: Nenhum pedido encontrado
 */
router.get("/", authMiddleware, (req, res) => orderController.getOrders(req, res));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualiza status do pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: "shipped"
 *     responses:
 *       200:
 *         description: Status atualizado
 *       404:
 *         description: Pedido não encontrado
 */
router.patch("/:id/status", authMiddleware, validate(updateOrderStatusSchema), (req, res) => orderController.updateStatus(req, res));

export default router;
