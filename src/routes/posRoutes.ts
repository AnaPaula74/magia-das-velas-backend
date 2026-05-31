import { Router } from "express";
import controller from "../controllers/posController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createPosSaleSchema, posSalesQuerySchema } from "../validators/posValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();

/**
 * @swagger
 * /pos/sales:
 *   post:
 *     summary: Cria uma venda no ponto de venda (PDV)
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, pix, mercadopago]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.post(
  "/sales",
  authMiddleware,
  roleMiddleware("admin", "cashier"),
  validate(createPosSaleSchema),
  (req, res) => controller.createSale(req, res)
);

/**
 * @swagger
 * /pos/sales:
 *   get:
 *     summary: Lista vendas de PDV
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cash, card, pix, mercadopago]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, cancelled, shipped, delivered]
 *     responses:
 *       200:
 *         description: Lista de vendas retornada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get(
  "/sales",
  authMiddleware,
  roleMiddleware("admin", "cashier"),
  validate(posSalesQuerySchema, "query"),
  (req, res) => controller.getSales(req, res)
);

/**
 * @swagger
 * /pos/sales/{id}:
 *   get:
 *     summary: Busca uma venda de PDV por ID
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venda retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Venda não encontrada
 */
router.get(
  "/sales/:id",
  authMiddleware,
  roleMiddleware("admin", "cashier"),
  validate(idParamSchema, "params"),
  (req, res) => controller.getSaleById(req, res)
);

/**
 * @swagger
 * /pos/sales/{id}/cancel:
 *   patch:
 *     summary: Cancela uma venda POS finalizada
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venda cancelada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Venda não encontrada
 */
router.patch(
  "/sales/:id/cancel",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.cancelSale(req, res)
);

export default router;
