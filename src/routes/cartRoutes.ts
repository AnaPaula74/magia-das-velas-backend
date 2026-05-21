import { Router } from "express";
import { CartController } from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { addCartSchema, updateCartSchema } from "../validators/cartValidator.js";
import { logger } from "../utils/logger.js";

const router = Router();
const cartController = new CartController();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Endpoints do carrinho
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Adiciona item ao carrinho
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       201: { description: Produto adicionado }
 *       400: { description: Erro de validação }
 */
router.post("/", authMiddleware, validate(addCartSchema), (req, res) => {
  logger.info("Rota POST /cart acessada");
  cartController.add(req, res);
});

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lista itens do carrinho
 *     tags: [Cart]
 *     responses:
 *       200: { description: Carrinho retornado }
 *       404: { description: Carrinho vazio }
 */
router.get("/", authMiddleware, (req, res) => {
  logger.info("Rota GET /cart acessada");
  cartController.get(req, res);
});

/**
 * @swagger
 * /cart/{id}:
 *   put:
 *     summary: Atualiza quantidade de item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Quantidade atualizada }
 *       404: { description: Item não encontrado }
 */
router.put("/:id", authMiddleware, validate(updateCartSchema), (req, res) => {
  logger.info("Rota PUT /cart/:id acessada");
  cartController.update(req, res);
});

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Remove item do carrinho
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Item removido }
 *       404: { description: Item não encontrado }
 */
router.delete("/:id", authMiddleware, (req, res) => {
  logger.info("Rota DELETE /cart/:id acessada");
  cartController.remove(req, res);
});

export default router;
