import { Router } from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/reviewValidator.js";
import {
  idParamSchema,
  productIdParamSchema,
} from "../validators/commonValidator.js";

const router = Router();
const controller = new ReviewController();

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Cria avaliação de produto
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Produto excelente.
 *     responses:
 *       201:
 *         description: Avaliação criada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       409:
 *         description: Usuário já avaliou este produto
 */
router.post(
  "/",
  authMiddleware,
  validate(createReviewSchema),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /reviews/{productId}:
 *   get:
 *     summary: Lista avaliações de um produto
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Avaliações listadas
 *       400:
 *         description: ID do produto inválido
 */
router.get(
  "/:productId",
  validate(productIdParamSchema, "params"),
  (req, res) => controller.getByProduct(req, res)
);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Atualiza uma avaliação do usuário autenticado
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID da avaliação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Produto muito bom.
 *     responses:
 *       200:
 *         description: Avaliação atualizada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Avaliação não encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  validate(updateReviewSchema),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Remove uma avaliação do usuário autenticado
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação removida
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Avaliação não encontrada
 */
router.delete(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.delete(req, res)
);

export default router;
