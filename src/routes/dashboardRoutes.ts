import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

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
 */
router.get("/stats", authMiddleware, (req, res) => dashboardController.getStats(req, res));

/**
 * @swagger
 * /dashboard/top-products:
 *   get:
 *     summary: Retorna produtos mais vendidos
 *     tags: [Dashboard]
 */
router.get("/top-products", authMiddleware, (req, res) => dashboardController.topProducts(req, res));

export default router;
