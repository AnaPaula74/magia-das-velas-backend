import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { logger } from "../utils/logger.js";

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints de estatísticas
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Retorna estatísticas gerais
 *     tags: [Dashboard]
 *     responses:
 *       200: { description: Estatísticas retornadas }
 */
router.get("/stats", authMiddleware, (req, res) => {
  logger.info("Rota GET /dashboard/stats acessada");
  dashboardController.getStats(req, res);
});

/**
 * @swagger
 * /dashboard/top-products:
 *   get:
 *     summary: Retorna produtos mais vendidos
 *     tags: [Dashboard]
 *     responses:
 *       200: { description: Produtos retornados }
 */
router.get("/top-products", authMiddleware, (req, res) => {
  logger.info("Rota GET /dashboard/top-products acessada");
  dashboardController.topProducts(req, res);
});

export default router;
