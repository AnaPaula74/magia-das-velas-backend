import { Router } from "express";
import { listAddresses, addAddress, updateAddress, deleteAddress } from "../controllers/addressController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Endpoints de endereços de entrega
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Lista endereços do usuário autenticado
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de endereços
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   street: "Rua das Flores"
 *                   city: "Rio de Janeiro"
 *                   state: "RJ"
 *                   zip: "22000-000"
 *   post:
 *     summary: Cria novo endereço
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             street: "Av. Brasil"
 *             city: "São Pedro da Aldeia"
 *             state: "RJ"
 *             zip: "28940-000"
 *     responses:
 *       201:
 *         description: Endereço criado
 */
router.get("/addresses", authMiddleware, listAddresses);
router.post("/addresses", authMiddleware, addAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Atualiza endereço
 *     tags: [Addresses]
 *   delete:
 *     summary: Remove endereço
 *     tags: [Addresses]
 */
router.put("/addresses/:id", authMiddleware, updateAddress);
router.delete("/addresses/:id", authMiddleware, deleteAddress);

export default router;
