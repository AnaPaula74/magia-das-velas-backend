import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { updateOrderStatusSchema } from "../validators/orderValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Finaliza o carrinho e cria um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pedido criado
 *       400:
 *         description: Estoque insuficiente ou erro de validação
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Carrinho vazio
 */
router.post("/checkout", authMiddleware, (req, res) =>
  orderController.checkout(req, res)
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista pedidos do usuário autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedidos listados
 *       401:
 *         description: Não autenticado
 */
router.get("/", authMiddleware, (req, res) =>
  orderController.getOrders(req, res)
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualiza status de um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, cancelled, shipped, delivered]
 *                 example: paid
 *     responses:
 *       200:
 *         description: Status atualizado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
 */
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  (req, res) => orderController.updateStatus(req, res)
);

router.get(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => orderController.getOrderById(req, res)
);

export default router;
