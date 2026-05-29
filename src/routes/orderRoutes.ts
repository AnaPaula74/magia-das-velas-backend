// src/routes/orderRoutes.ts

import { Router } from "express";

import controller from "../controllers/orderController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";

import { updateOrderStatusSchema } from "../validators/orderValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();

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
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Estoque insuficiente ou dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Carrinho vazio
 */
router.post("/checkout", authMiddleware, (req, res) =>
  controller.checkout(req, res)
);

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Lista todos os pedidos para administração
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedidos listados com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  (req, res) => controller.getAllOrders(req, res)
);

/**
 * @swagger
 * /orders/admin/{id}:
 *   get:
 *     summary: Busca um pedido por ID para administração
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido retornado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
 */
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.getOrderByIdForAdmin(req, res)
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - paid
 *                   - cancelled
 *                   - shipped
 *                   - delivered
 *                 example: paid
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
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
  (req, res) => controller.updateStatus(req, res)
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista os pedidos do usuário autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedidos listados com sucesso
 *       401:
 *         description: Usuário não autenticado
 */
router.get("/", authMiddleware, (req, res) =>
  controller.getOrders(req, res)
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Busca um pedido do usuário autenticado por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido retornado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Pedido não encontrado
 */
router.get(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.getOrderById(req, res)
);

export default router;
