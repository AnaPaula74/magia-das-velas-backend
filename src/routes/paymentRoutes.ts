import { Router } from "express";
import { PaymentController } from "../controllers/paymentController.js";

const router = Router();
const controller = new PaymentController();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Rotas de pagamentos
 */

/**
 * @swagger
 * /payments/pix:
 *   post:
 *     summary: Criar pagamento Pix
 *     description: Cria um pagamento Pix usando Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - email
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 59.90
 *               description:
 *                 type: string
 *                 example: Compra de velas
 *               email:
 *                 type: string
 *                 example: cliente@email.com
 *     responses:
 *       201:
 *         description: Pix criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */
router.post("/pix", (req, res) =>
  controller.createPixPayment(req, res)
);

/**
 * @swagger
 * /payments/checkout:
 *   post:
 *     summary: Criar checkout Mercado Pago
 *     description: Cria link de pagamento Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 89.90
 *               description:
 *                 type: string
 *                 example: Kit espiritual
 *     responses:
 *       201:
 *         description: Checkout criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */
router.post("/checkout", (req, res) =>
  controller.createMercadoPagoPayment(req, res)
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook Mercado Pago
 *     description: Recebe notificações automáticas do Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               type: payment
 *               data:
 *                 id: 123456789
 *     responses:
 *       200:
 *         description: Webhook processado
 *       400:
 *         description: Erro ao processar webhook
 */
router.post("/webhook", (req, res) =>
  controller.handleWebhook(req, res)
);

export default router;