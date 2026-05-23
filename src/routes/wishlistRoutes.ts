import { Router } from "express";
import { WishlistController } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { addWishlistSchema } from "../validators/wishlistValidator.js";

const router = Router();
const wishlistController = new WishlistController();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Endpoints de favoritos (wishlist)
 */

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Adiciona produto à wishlist
 *     description: Permite que o usuário adicione um produto à sua lista de favoritos.
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             productId: 15
 *     responses:
 *       201:
 *         description: Produto adicionado à wishlist
 *       400:
 *         description: Erro de validação
 */
router.post("/", authMiddleware, validate(addWishlistSchema), (req, res) => wishlistController.add(req, res));

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Lista wishlist do usuário
 *     description: Retorna todos os produtos favoritos do usuário autenticado.
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - productId: 15
 *                   name: "Vela aromática"
 *                   price: 29.90
 *       404:
 *         description: Wishlist vazia
 */
router.get("/", authMiddleware, (req, res) => wishlistController.list(req, res));

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove produto da wishlist
 *     description: Remove um produto específico da lista de favoritos do usuário.
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Produto removido da wishlist
 *       404:
 *         description: Produto não encontrado na wishlist
 */
router.delete("/:productId", authMiddleware, (req, res) => wishlistController.remove(req, res));

export default router;
