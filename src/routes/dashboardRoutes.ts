import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  salesReportQuerySchema,
  topProductsQuerySchema,
} from "../validators/dashboardValidator.js";

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Retorna estatísticas gerais do e-commerce
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Estatísticas retornadas
 *               data:
 *                 totalProducts: 20
 *                 totalUsers: 15
 *                 totalOrders: 8
 *                 totalSales: 450.9
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get("/stats", authMiddleware, adminMiddleware, (req, res) =>
  dashboardController.getStats(req, res)
);

/**
 * @swagger
 * /dashboard/top-products:
 *   get:
 *     summary: Lista produtos mais vendidos
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtos mais vendidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get(
  "/top-products",
  authMiddleware,
  adminMiddleware,
  validate(topProductsQuerySchema, "query"),
  (req, res) => dashboardController.topProducts(req, res)
);

/**
 * @swagger
 * /dashboard/sales-report:
 *   get:
 *     summary: Retorna relatório de vendas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de vendas retornado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get(
  "/sales-report",
  authMiddleware,
  adminMiddleware,
  validate(salesReportQuerySchema, "query"),
  (req, res) => dashboardController.getSalesReport(req, res)
);

/**
 * @swagger
 * /dashboard/user-metrics:
 *   get:
 *     summary: Retorna métricas de usuários
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de usuários retornadas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get("/user-metrics", authMiddleware, adminMiddleware, (req, res) =>
  dashboardController.getUserMetrics(req, res)
);

export default router;
