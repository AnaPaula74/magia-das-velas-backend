import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";

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
router.get("/top-products", authMiddleware, adminMiddleware, (req, res) =>
  dashboardController.topProducts(req, res)
);

router.get("/sales-report", authMiddleware, adminMiddleware, (req, res) =>
  dashboardController.getSalesReport(req, res)
);

router.get("/user-metrics", authMiddleware, adminMiddleware, (req, res) =>
  dashboardController.getUserMetrics(req, res)
);

export default router;
