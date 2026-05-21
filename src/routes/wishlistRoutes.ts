import { Router } from "express";
import { WishlistController } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { addWishlistSchema } from "../validators/wishlistValidator.js";
import { logger } from "../utils/logger.js";

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
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: integer }
 *     responses:
 *       201: { description: Produto adicionado à wishlist }
 *       400: { description: Erro de validação }
 */
router.post("/", authMiddleware, validate(addWishlistSchema), (req, res) => {
  logger.info("Rota POST /wishlist acessada");
  wishlistController.add(req, res);
});

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Lista wishlist do usuário
 *     tags: [Wishlist]
 *     responses:
 *       200: { description: Lista retornada }
 *       404: { description: Wishlist vazia }
 */
router.get("/", authMiddleware, (req, res) => {
  logger.info("Rota GET /wishlist acessada");
  wishlistController.list(req, res);
});

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove produto da wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Produto removido da wishlist }
 *       404: { description: Produto não encontrado na wishlist }
 */
router.delete("/:productId", authMiddleware, (req, res) => {
  logger.info("Rota DELETE /wishlist/:productId acessada");
  wishlistController.remove(req, res);
});

export default router;
