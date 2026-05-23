import { Router } from "express";
import { PaymentController } from "../controllers/paymentController.js";

const router = Router();
const controller = new PaymentController();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Endpoints de pagamentos
 */

/**
 * @swagger
 * /payments/pix:
 *   post:
 *     summary: Criar pagamento Pix
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             amount: 59.90
 *             description: "Compra de velas"
 *             email: "cliente@email.com"
 *     responses:
 *       201:
 *         description: Pix criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/pix", (req, res) => controller.createPixPayment(req, res));

/**
 * @swagger
 * /payments/checkout:
 *   post:
 *     summary: Criar checkout Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             amount: 89.90
 *             description: "Kit espiritual"
 *     responses:
 *       201:
 *         description: Checkout criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/checkout", (req, res) => controller.createMercadoPagoPayment(req, res));

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           example:
 *             type: "payment"
 *             data:
 *               id: 123456789
 *     responses:
 *       200:
 *         description: Webhook processado
 */
router.post("/webhook", (req, res) => controller.handleWebhook(req, res));

export default router;
