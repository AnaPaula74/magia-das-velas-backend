import { Router } from "express";
import { ProductController } from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { productSchema } from "../validators/productValidator.js";

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Endpoints de produtos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get("/", (req, res) => productController.getAll(req, res));

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
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get("/:id", (req, res) => productController.getById(req, res));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria novo produto (admin)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           example:
 *             name: "Vela aromática"
 *             description: "Vela de lavanda"
 *             price: 29.90
 *             stock: 100
 *             image: (arquivo)
 *     responses:
 *       201:
 *         description: Produto criado
 */
router.post("/", authMiddleware, adminMiddleware, validate(productSchema), upload.single("image"), (req, res) => productController.create(req, res));

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza produto (admin)
 *     tags: [Products]
 *   delete:
 *     summary: Remove produto (admin)
 *     tags: [Products]
 */
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), (req, res) => productController.update(req, res));
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => productController.delete(req, res));

export default router;
