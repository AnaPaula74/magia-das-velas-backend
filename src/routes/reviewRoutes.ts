import { Router } from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createReviewSchema } from "../validators/reviewValidator.js";
import { logger } from "../utils/logger.js";

const router = Router();
const reviewController = new ReviewController();

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Endpoints de avaliações
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Cria review para produto
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: integer }
 *               rating: { type: integer }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review criada }
 *       400: { description: Erro de validação }
 */
router.post("/", authMiddleware, validate(createReviewSchema), (req, res) => {
  logger.info("Rota POST /reviews acessada");
  reviewController.create(req, res);
});

/**
 * @swagger
 * /reviews/{productId}:
 *   get:
 *     summary: Lista reviews de um produto
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Reviews retornadas }
 *       404: { description: Nenhuma review encontrada }
 */
router.get("/:productId", (req, res) => {
  logger.info("Rota GET /reviews/:productId acessada");
  reviewController.getByProduct(req, res);
});

export default router;
