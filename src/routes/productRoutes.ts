import { Router } from "express";
import { ProductController } from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  productSchema,
  updateProductSchema,
} from "../validators/productValidator.js";
import {
  idParamSchema,
  productQuerySchema,
} from "../validators/commonValidator.js";

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista produtos
 *     description: Retorna produtos paginados, com busca por nome e ordenação.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Página da listagem
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: vela
 *         description: Busca por nome do produto
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           example: DESC
 *         description: Ordenação por data de criação
 *     responses:
 *       200:
 *         description: Produtos listados
 *       400:
 *         description: Query inválida
 */
router.get(
  "/",
  validate(productQuerySchema, "query"),
  (req, res) => productController.getAll(req, res)
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Produto não encontrado
 */
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  (req, res) => productController.getById(req, res)
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria produto
 *     description: Cria um novo produto com upload opcional de imagem. Apenas administradores.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vela de Limpeza Espiritual
 *               description:
 *                 type: string
 *                 example: Vela artesanal para limpeza energética.
 *               price:
 *                 type: number
 *                 example: 39.9
 *               stock:
 *                 type: integer
 *                 example: 20
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  validate(productSchema),
  (req, res) => productController.create(req, res)
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza produto
 *     description: Atualiza os dados de um produto. Se nenhuma nova imagem for enviada, mantém a imagem antiga.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vela de Proteção
 *               description:
 *                 type: string
 *                 example: Produto atualizado.
 *               price:
 *                 type: number
 *                 example: 49.9
 *               stock:
 *                 type: integer
 *                 example: 15
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  upload.single("image"),
  validate(updateProductSchema),
  (req, res) => productController.update(req, res)
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Remove produto
 *     description: Remove um produto. Apenas administradores.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => productController.delete(req, res)
);

export default router;
