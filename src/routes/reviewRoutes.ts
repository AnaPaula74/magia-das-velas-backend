import { Router } from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createReviewSchema } from "../validators/reviewValidator.js";

const router = Router();
const reviewController = new ReviewController();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Endpoints de avaliações de produtos
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Cria review para produto
 *     description: Permite que um usuário autenticado avalie um produto com nota e comentário.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             productId: 10
 *             rating: 5
 *             comment: "Produto excelente, recomendo!"
 *     responses:
 *       201:
 *         description: Review criada com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post("/", authMiddleware, validate(createReviewSchema), (req, res) => reviewController.create(req, res));

/**
 * @swagger
 * /reviews/{productId}:
 *   get:
 *     summary: Lista reviews de um produto
 *     description: Retorna todas as avaliações de um produto específico.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reviews retornadas
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   productId: 10
 *                   rating: 5
 *                   comment: "Ótimo produto"
 *                   userId: 2
 *       404:
 *         description: Nenhuma review encontrada
 */
router.get("/:productId", (req, res) => reviewController.getByProduct(req, res));

export default router;
