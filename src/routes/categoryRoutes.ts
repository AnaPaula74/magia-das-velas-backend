import { Router } from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  categorySchema,
  updateCategorySchema,
} from "../validators/categoryValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();
const controller = new CategoryController();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categorias listadas
 */
router.get("/", (req, res) => controller.list(req, res));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Busca categoria por ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoria não encontrada
 */
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  (req, res) => controller.get(req, res)
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Velas
 *               description:
 *                 type: string
 *                 example: Velas ritualísticas e aromáticas
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Categoria já existente
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(categorySchema),
  (req, res) => controller.add(req, res)
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Incensos
 *               description:
 *                 type: string
 *                 example: Incensos naturais e aromáticos
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Categoria não encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remove categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria removida
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Categoria não encontrada
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.delete(req, res)
);

export default router;
