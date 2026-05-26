import { Router } from "express";
import { CartController } from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  addCartSchema,
  updateCartSchema,
} from "../validators/cartValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();
const controller = new CartController();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Retorna o carrinho do usuário autenticado
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho retornado
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Carrinho vazio
 */
router.get(
  "/",
  authMiddleware,
  (req, res) => controller.get(req, res)
);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Adiciona produto ao carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Produto adicionado ao carrinho
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Produto não encontrado
 */
router.post(
  "/",
  authMiddleware,
  validate(addCartSchema),
  (req, res) => controller.add(req, res)
);

/**
 * @swagger
 * /cart/{id}:
 *   put:
 *     summary: Atualiza quantidade de um item do carrinho
 *     description: O usuário só pode atualizar itens do próprio carrinho.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do item do carrinho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantidade atualizada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Item não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  validate(updateCartSchema),
  (req, res) => controller.update(req, res)
);

router.delete(
  "/clear",
  authMiddleware,
  (req, res) => controller.clear(req, res)
);

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Remove item do carrinho
 *     description: O usuário só pode remover itens do próprio carrinho.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do item do carrinho
 *     responses:
 *       200:
 *         description: Item removido do carrinho
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Item não encontrado
 */
router.delete(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.remove(req, res)
);

export default router;
