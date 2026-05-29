import { Router } from "express";
import { WishlistController } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { addWishlistSchema } from "../validators/wishlistValidator.js";
import { productIdParamSchema } from "../validators/commonValidator.js";

const router = Router();
const controller = new WishlistController();

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Lista produtos favoritos do usuário autenticado
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retornada
 *       401:
 *         description: Usuário não autenticado
 */
router.get(
  "/",
  authMiddleware,
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Adiciona produto à wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produto adicionado à wishlist
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       409:
 *         description: Produto já está na wishlist
 */
router.post(
  "/",
  authMiddleware,
  validate(addWishlistSchema),
  (req, res) => controller.add(req, res)
);

/**
 * @swagger
 * /wishlist/{productId}/exists:
 *   get:
 *     summary: Verifica se um produto está na wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
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
 *         description: Resultado da verificação retornado
 *       400:
 *         description: ID do produto inválido
 *       401:
 *         description: Usuário não autenticado
 */
router.get(
  "/:productId/exists",
  authMiddleware,
  validate(productIdParamSchema, "params"),
  (req, res) => controller.checkIfExists(req, res)
);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove produto da wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
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
 *         description: Produto removido da wishlist
 *       400:
 *         description: ID do produto inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Produto não encontrado na wishlist
 */
router.delete(
  "/:productId",
  authMiddleware,
  validate(productIdParamSchema, "params"),
  (req, res) => controller.remove(req, res)
);

export default router;
