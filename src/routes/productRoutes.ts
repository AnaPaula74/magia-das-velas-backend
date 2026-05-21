import { Router } from "express";
import { ProductController } from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { productSchema } from "../validators/productValidator.js";
import { logger } from "../utils/logger.js";

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Endpoints de produtos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Product]
 *     responses:
 *       200: { description: Lista de produtos }
 */
router.get("/", (req, res) => {
  logger.info("Rota GET /products acessada");
  productController.getAll(req, res);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Produto encontrado }
 *       404: { description: Produto não encontrado }
 */
router.get("/:id", (req, res) => {
  logger.info("Rota GET /products/:id acessada");
  productController.getById(req, res);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria novo produto (admin)
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Produto criado }
 *       400: { description: Erro de validação }
 */
router.post("/", authMiddleware, adminMiddleware, validate(productSchema), upload.single("image"), (req, res) => {
  logger.info("Rota POST /products acessada");
  productController.create(req, res);
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza produto (admin)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Produto atualizado }
 *       404: { description: Produto não encontrado }
 */
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), (req, res) => {
  logger.info("Rota PUT /products/:id acessada");
  productController.update(req, res);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Remove produto (admin)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Produto removido }
 *       404: { description: Produto não encontrado }
 */
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  logger.info("Rota DELETE /products/:id acessada");
  productController.delete(req, res);
});

export default router;
