import { Router } from "express";
import { listCategories, getCategory, addCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Endpoints de categorias
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Velas"
 *             description: "Velas aromáticas e religiosas"
 */
router.get("/categories", listCategories);
router.post("/categories", addCategory);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Busca categoria por ID
 *     tags: [Categories]
 *   put:
 *     summary: Atualiza categoria
 *     tags: [Categories]
 *   delete:
 *     summary: Remove categoria
 *     tags: [Categories]
 */
router.get("/categories/:id", getCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
