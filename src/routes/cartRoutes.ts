import { Router } from "express";
import { CartController } from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { addCartSchema, updateCartSchema } from "../validators/cartValidator.js";

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
 *           example:
 *             productId: 10
 *             quantity: 2
 *     responses:
 *       201:
 *         description: Produto adicionado
 *       400:
 *         description: Erro de validação
 */
router.post("/", authMiddleware, validate(addCartSchema), (req, res) => cartController.add(req, res));

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lista itens do carrinho
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Carrinho retornado
 *       404:
 *         description: Carrinho vazio
 */
router.get("/", authMiddleware, (req, res) => cartController.get(req, res));

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             quantity: 3
 *     responses:
 *       200:
 *         description: Quantidade atualizada
 *       404:
 *         description: Item não encontrado
 */
router.put("/:id", authMiddleware, validate(updateCartSchema), (req, res) => cartController.update(req, res));

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
 *       200:
 *         description: Item removido
 *       404:
 *         description: Item não encontrado
 */
router.delete("/:id", authMiddleware, (req, res) => cartController.remove(req, res));

export default router;
