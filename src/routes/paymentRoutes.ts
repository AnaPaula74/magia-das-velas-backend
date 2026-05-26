import { Router } from "express";
import { PaymentController } from "../controllers/paymentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  pixPaymentSchema,
  mercadoPagoSchema,
  paymentReferenceParamSchema,
} from "../validators/paymentValidator.js";

const router = Router();
const controller = new PaymentController();

/**
 * @swagger
 * /payments/pix:
 *   post:
 *     summary: Cria pagamento Pix pelo Mercado Pago
 *     description: Cria um pagamento Pix usando o total real do pedido salvo no backend.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pagamento Pix criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Falha ao criar pagamento Pix
 */
router.post(
  "/pix",
  authMiddleware,
  validate(pixPaymentSchema),
  (req, res) => controller.createPixPayment(req, res)
);

/**
 * @swagger
 * /payments/checkout:
 *   post:
 *     summary: Cria checkout Mercado Pago
 *     description: Cria um link de pagamento usando o total real do pedido salvo no backend.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Checkout criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Falha ao criar checkout Mercado Pago
 */
router.post(
  "/checkout",
  authMiddleware,
  validate(mercadoPagoSchema),
  (req, res) => controller.createMercadoPagoPayment(req, res)
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Recebe webhook do Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: payment
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123456789
 *     responses:
 *       200:
 *         description: Webhook processado
 *       400:
 *         description: Erro ao processar webhook
 */
router.post("/webhook", (req, res) =>
  controller.handleWebhook(req, res)
);

router.get(
  "/:id/status",
  authMiddleware,
  validate(paymentReferenceParamSchema, "params"),
  (req, res) => controller.getPaymentStatus(req, res)
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  validate(paymentReferenceParamSchema, "params"),
  (req, res) => controller.cancelPayment(req, res)
);

export default router;
